
import datetime
import os
import subprocess
from pathlib import Path


def get_ignored_patterns():
    ignored_patterns = set()
    
    # .gitignore の読み込み
    if os.path.exists('.gitignore'):
        with open('.gitignore', 'r') as f:
            ignored_patterns.update(line.strip() for line in f if line.strip() and not line.startswith('#'))
    
    # .cursorignore の読み込み
    if os.path.exists('.cursorignore'):
        with open('.cursorignore', 'r') as f:
            ignored_patterns.update(line.strip() for line in f if line.strip() and not line.startswith('#'))
    
    return ignored_patterns

def should_include(path, ignored_patterns):
    path_str = str(path)
    for pattern in ignored_patterns:
        if pattern in path_str or path_str.endswith(pattern):
            return False
    return True

def format_file_structure(files):
    # ファイルをディレクトリ構造に変換
    file_tree = {'files': [], 'dirs': {}}
    for file_path in files:
        parts = Path(file_path).parts
        current = file_tree
        for part in parts[:-1]:
            if part not in current['dirs']:
                current['dirs'][part] = {'files': [], 'dirs': {}}
            current = current['dirs'][part]
        current['files'].append(parts[-1])

    # 整形された出力を生成
    def format_tree(tree, prefix=''):
        output = []
        
        # ディレクトリを処理
        dirs = sorted(tree['dirs'].keys())
        for i, dir_name in enumerate(dirs):
            is_last_dir = i == len(dirs) - 1 and not tree['files']
            connector = '└── ' if is_last_dir else '├── '
            output.append(f'{prefix}{connector}📁 {dir_name}/')
            
            new_prefix = prefix + ('    ' if is_last_dir else '│   ')
            output.extend(format_tree(tree['dirs'][dir_name], new_prefix))
        
        # ファイルを処理
        files = sorted(tree['files'])
        for i, file_name in enumerate(files):
            is_last_file = i == len(files) - 1
            connector = '└── ' if is_last_file else '├── '
            # ファイルタイプに応じた絵文字を設定
            emoji = '📄'
            if file_name.endswith(('.py', '.js', '.ts', '.jsx', '.tsx')):
                emoji = '🔧'
            elif file_name.endswith(('.md', '.txt', '.doc', '.pdf')):
                emoji = '📝'
            elif file_name.endswith(('.jpg', '.png', '.gif', '.svg')):
                emoji = '🖼️'
            output.append(f'{prefix}{connector}{emoji} {file_name}')
        
        return output

    return '\n'.join(format_tree(file_tree))

def save_file_structure():
    # docs ディレクトリの作成
    output_dir = Path('docs')
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / 'file_structure.md'
    
    # git ls-files を使用してバージョン管理されているファイルを取得
    try:
        git_files = subprocess.check_output(['git', 'ls-files'], text=True).splitlines()
    except subprocess.CalledProcessError:
        git_files = []
    
    ignored_patterns = get_ignored_patterns()
    
    # ファイル一覧を収集
    all_files = set()
    for path in Path('.').rglob('*'):
        if path.is_file() and should_include(path, ignored_patterns):
            all_files.add(str(path))
    
    # git ls-files の結果も追加
    all_files.update(git_files)
    
    # 結果をファイルに保存
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(f'File Structure Generated at: {datetime.datetime.now()}\n')
        f.write('=' * 50 + '\n\n')
        f.write(format_file_structure(sorted(all_files)))
        f.write('\n\n')
        f.write('Legend:\n')
        f.write('📁 : Directory\n')
        f.write('🔧 : Source Code\n')
        f.write('📝 : Documentation\n')
        f.write('🖼️ : Image\n')
        f.write('📄 : Other Files\n')

if __name__ == '__main__':
    save_file_structure()
    #try:
    #    from analyze_python_files import save_python_analysis
    #    save_python_analysis()
    #except Exception as e:
   #     print(f"Pythonファイル解析中にエラーが発生しました: {e}")