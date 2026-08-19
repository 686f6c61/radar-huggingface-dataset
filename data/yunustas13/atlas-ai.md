# YunusTAS13/ATLAS-AI

## Resumen

ATLAS-AI es un modelo de lenguaje especializado en turco, desarrollado por el autor independiente YunusTAS13, que combina un ajuste fino con QLoRA sobre el modelo base Qwen3-8B con un agente de control de ordenador en sandbox seguro. El proyecto se presenta como "ATLAS", con una identidad propia y un comportamiento orientado a la seguridad, capaz de rechazar peticiones dañinas y operar exclusivamente dentro de un directorio de trabajo aislado. Su relevancia radica en ofrecer una alternativa de código abierto con licencia GPL-3.0 para el ecosistema turco, integrando capacidades de tool calling y un host de agente que permite interactuar con el sistema de archivos y ejecutar comandos de terminal de forma controlada.

El modelo tiene 8.190.735.360 parámetros (8B), se distribuye en formato GGUF cuantizado a Q4_K_M (~4,7 GB) y está diseñado para funcionar en CPU o GPU con al menos 6 GB de VRAM. Aunque no se especifica la longitud de contexto en la documentación proporcionada, al estar basado en Qwen3-8B, es probable que herede la ventana de 32K tokens de dicho modelo, aunque este dato no se confirma en la ficha. El proyecto incluye un agente Python (`atlas_agent.py`) que actúa como host, con registro de auditoría y múltiples capas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No especificada en la documentacion; el modelo base Qwen3-8B soporta 32K tokens, pero no se confirma para esta adaptacion |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada) |
| Idiomas soportados | Turco (tr) |
| Licencia | GPL-3.0 |
| Formato de pesos | GGUF (safetensors no publicado; el repo contiene el archivo `atlas-q4km.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso con arquitectura estándar de decoder-only, y se ajusta mediante QLoRA con cuantización de 4 bits en formato NF4. Los hiperparámetros de LoRA son r=8, alpha=16 y dropout=0.05, y se utiliza el optimizador AdamW de 8 bits. No se especifican en la documentación el número de tokens de entrenamiento ni la composición del dataset, aunque se menciona un "entrenamiento conductual" (behavioral training) para reforzar el rechazo de peticiones dañinas y la generación de respuestas seguras. La innovación principal no reside en la arquitectura, sino en la capa de agente: un script Python que envuelve al modelo y lo restringe a un sandbox (`~/atlas-workspace`), con filtrado de comandos peligrosos, bloqueo de rutas del sistema y registro de todas las acciones en un archivo `audit.log`.

## Capacidades

- Generación de texto en turco con foco en conversación, conocimiento y escritura.
- Identidad propia: se presenta como "ATLAS" con una personalidad definida.
- Tool calling: listado, lectura y escritura de archivos, gestión de directorios y ejecución de comandos de terminal seguros.
- Agente autónomo: puede controlar el ordenador del usuario dentro de un sandbox, con confirmación previa de comandos (o sin ella con `--no-confirm`).
- Seguridad por capas: rechazo de peticiones dañinas por entrenamiento conductual, filtrado a nivel de sistema y registro de auditoría.
- Compatibilidad con Ollama y llama.cpp para inferencia local.
- Soporte multiplataforma para el modelo (Linux, macOS, Windows), aunque el agente host solo está disponible para Linux y macOS.

## Casos de uso

- Atención al cliente en turco: el modelo puede gestionar conversaciones de soporte en turco con un tono seguro y controlado, gracias a su entrenamiento específico en este idioma y su comportamiento de rechazo ante peticiones inapropiadas.
- Asistente personal de archivos: mediante el agente, el usuario puede pedirle a ATLAS que liste, lea o escriba archivos dentro del directorio de trabajo, útil para organizar documentos o notas sin exponer el resto del sistema.
- Automatización de tareas de terminal: el agente puede ejecutar comandos seguros (por ejemplo, `ls`, `cat`, `mkdir`) previa confirmación, lo que permite delegar operaciones rutinarias en un entorno controlado.
- Generación de contenido en turco: redacción de textos, resúmenes o borradores en turco con una identidad consistente, aprovechando el ajuste fino en este idioma.
- Entorno educativo de agentes: dado su sandbox y registro de auditoría, sirve como plataforma de aprendizaje para experimentar con agentes de IA sin riesgo de dañar el sistema.
- Despliegue en entornos con recursos limitados: al ser un GGUF Q4_K_M (~4,7 GB), puede ejecutarse en CPU con 8 GB de RAM, lo que lo hace adecuado para equipos sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- CPU mínima: cualquier x86-64 moderno con soporte AVX2; se recomienda un procesador de 8+ núcleos.
- RAM: mínimo 8 GB, recomendado 16 GB.
- GPU: no requerida para inferencia en CPU; se recomienda una NVIDIA con 6+ GB de VRAM para aceleración.
- Almacenamiento: 5 GB libres como mínimo, 10 GB en SSD recomendado.
- Inferencia en CPU: funcional pero más lenta; con GPU las respuestas son significativamente más rápidas.
- Opciones de despliegue: Ollama (comando `ollama create atlas -f Modelfile`), llama.cpp (archivo GGUF), y el agente Python `atlas_agent.py` para Linux/macOS.
- Latencia y throughput: no especificados en la documentación.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Al estar basado en Qwen3-8B, podría compararse con el propio Qwen3-8B base o con otros modelos turcos como Trendyol-LLM, pero no hay métricas publicadas para ATLAS-AI que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Idioma limitado: el modelo está enfocado exclusivamente en turco; no se garantiza rendimiento en otros idiomas.
- Licencia GPL-3.0: cualquier uso comercial o redistribución debe cumplir con los términos copyleft de esta licencia, lo que puede ser restrictivo para integraciones propietarias.
- El agente host solo funciona en Linux y macOS; en Windows solo se puede usar el modelo vía Ollama (o mediante WSL).
- El sandbox restringe el acceso a rutas del sistema y comandos peligrosos, pero no es una garantía absoluta de seguridad; se recomienda precaución al usar `--no-confirm`.
- No se han publicado benchmarks ni evaluaciones independientes, por lo que el rendimiento real en tareas complejas es desconocido.
- El modelo base Qwen3-8B puede arrastrar sesgos o alucinaciones; el ajuste fino no elimina estos riesgos.
- La longitud de contexto no está documentada; si se heredan los 32K de Qwen3-8B, podría degradarse con entradas muy largas, pero esto no está confirmado.

## Enlaces

- Hugging Face: https://huggingface.co/YunusTAS13/ATLAS-AI
- Archivo GGUF directo: https://huggingface.co/YunusTAS13/ATLAS-AI/resolve/main/atlas-q4km.gguf
- Perfil de GitHub del autor: https://github.com/YunusTAS13
- Repositorio del proyecto (no verificado en los resultados de búsqueda): https://github.com/YunusTAS13/ATLAS-AI (referenciado en la model card)
