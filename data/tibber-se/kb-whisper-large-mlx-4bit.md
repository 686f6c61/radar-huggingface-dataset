# Tibber-se/kb-whisper-large-mlx-4bit

## Resumen

KB-Whisper large en formato MLX 4-bit es una conversión no oficial del modelo de reconocimiento automático del habla `KBLab/kb-whisper-large`, desarrollado por KBLab (el laboratorio de datos de la Biblioteca Nacional de Suecia) y adaptado para ejecutarse localmente en Apple Silicon mediante `mlx-whisper`. La publicación corre a cargo de la organización Tibber-se como utilidad para sus colegas y para la comunidad, sin vinculación ni respaldo por parte de KBLab.

El modelo resuelve la transcripción de audio en sueco con una precisión muy superior a la de Whisper large-v3-turbo: un 5,2 % de WER frente al 8,7 % del modelo genérico en el conjunto de test de FLEURS (sueco), y prácticamente idéntico al 4,9 % de los pesos originales en fp32 (la diferencia es de unas 0,3 décimas). Al estar cuantizado a 4 bits con un tamaño de grupo de 64, el repositorio ocupa solo 0,9 GB, lo que permite inferencia local en un Mac con Apple Silicon sin enviar audio a ningún servicio externo.

Es relevante ahora porque ofrece una alternativa práctica y ligera para pipelines de transcripción en sueco sobre hardware de consumo, con licencia Apache-2.0 heredada del modelo base y sin dependencia de la nube. La contrapartida es que se trata de una conversión de conveniencia, sin soporte, con una única ejecución de validación y con limitaciones conocidas en marcas de tiempo a nivel de palabra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), conversión MLX |
| Parametros totales | no disponible (modelo base: Whisper large, ~1550 M según arquitectura estándar de Whisper large; no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s típica de Whisper; no confirmado en la información) |
| Tipos de cuantizacion | 4 bits, group size 64 (`-q --q-bits 4`), pesos en float16 durante la conversión |
| Idiomas soportados | sueco (`sv`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`weights.safetensors`) + `config.json`, formato MLX |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper large, un transformer encoder-decoder con atención estándar diseñado para transcripción y traducción de voz. Esta ficha no dispone de información sobre los datos de entrenamiento del modelo base `KBLab/kb-whisper-large` (número de tokens, composición del corpus, uso de RLHF o fine-tuning supervisado); esos detalles corresponden a la model card de KBLab, no incluida en la información proporcionada.

La innovación técnica de esta publicación es la conversión a MLX: se utilizó el script `whisper/convert.py` de `ml-explore/mlx-examples` (commit 796f5b5) ejecutado localmente con `--dtype float16` y cuantización de 4 bits con grupo de 64. El resultado son los mismos tensores que produce el conversor, renombrados a `weights.safetensors` para que el cargador de `mlx-whisper` de PyPI los encuentre. El modelo base se tomó en la revisión `d5d5984b4d8f7c4847a8ea203f1976285fb28300`.

## Capacidades

- Reconocimiento automático del habla (ASR) en sueco, con salida en texto plano, SRT y otros formatos vía `mlx_whisper`.
- Transcripción de audio local: los pesos y el audio permanecen en la máquina del usuario.
- Ejecución en Apple Silicon mediante `mlx-whisper` y `ffmpeg`.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo de razonamiento, visión ni audio más allá de la transcripción.
- Capacidad multilingüe limitada al sueco según los tags del repositorio.

## Casos de uso

- Transcripción de reuniones internas en sueco: el modelo procesa audio localmente en un Mac con Apple Silicon, evitando enviar grabaciones confidenciales a servicios en la nube y aprovechando el bajo WER (5,2 % en FLEURS) para actas y resúmenes posteriores.
- Generación de subtítulos SRT para vídeo en sueco: la interfaz `mlx_whisper` permite salida directa en formato SRT con `-f srt`, adecuada para publicar contenido accesible en plataformas internas o educativas.
- Investigación en lingüística sueca: transcripción de corpus orales con un modelo ajustado al sueco, útil para análisis fonético, léxico o de discurso sobre grabaciones de campo.
- Atención al cliente y análisis de llamadas: transcripción de conversaciones telefónicas en sueco para extracción de métricas y control de calidad, con la ventaja de que el audio no sale del equipo.
- Herramientas de accesibilidad: conversión de notas de voz y entrevistas en sueco a texto para personas con dificultades auditivas o para búsqueda posterior en archivos de audio.
- Prototipado rápido en Mac: desarrolladores que quieran validar un pipeline de ASR en sueco sin infraestructura GPU, usando `uvx --from mlx-whisper` y el modelo cuantizado de 0,9 GB.
- Archivística y patrimonio digital: transcripción de material audiovisual sueco en entornos con requisitos de privacidad, aprovechando la licencia Apache-2.0 para uso interno y comercial.

## Benchmarks y rendimiento

Word error rate sobre 100 clips del split de test de FLEURS (sueco, CC-BY-4.0), una sola ejecución, en un Mac con Apple Silicon:

| Modelo | WER |
|---|---|
| `whisper-large-v3-turbo` (MLX) | 8,7 % |
| `KBLab/kb-whisper-large` vía `transformers` (fp32, pesos originales) | 4,9 % |
| **Este modelo (MLX 4-bit)** | **5,2 %** (clip mediano 2,7 %, peor clip 33 %) |

El WER de corpus está a unas 0,3 décimas de los pesos originales. El autor advierte que FLEURS es habla leída y limpia, por lo que reuniones y llamadas reales obtendrán peores resultados, y que una única ejecución sobre 100 clips es una comprobación de cordura, no un benchmark formal. La normalización pasa a minúsculas y elimina puntuación, pero no normaliza números.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 0,9 GB en disco; la inferencia en MLX requiere memoria unificada del chip Apple Silicon, no VRAM dedicada.
- Hardware recomendado: Mac con Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se especifican requisitos mínimos de memoria en la información disponible.
- No cabe en GPU de consumidor x86 en este formato: MLX está diseñado para Apple Silicon; para CUDA habría que usar los pesos originales de KBLab con otra herramienta.
- Opciones de despliegue: `mlx-whisper` (PyPI) con `ffmpeg` instalado; ejemplo oficial: `uvx --from mlx-whisper mlx_whisper recording.m4a --model Tibber-se/kb-whisper-large-mlx-4bit --language sv -f srt`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/audio | WER (FLEURS sv) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Este modelo (KB-Whisper large MLX 4-bit)** | no disponible (~1550 M, no confirmado) | ventana de audio Whisper (30 s típica, no confirmado) | 5,2 % | Apache-2.0 | Hugging Face, MLX |
| `KBLab/kb-whisper-large` (original fp32) | no disponible | ídem | 4,9 % | Apache-2.0 | Hugging Face, transformers |
| `whisper-large-v3-turbo` (MLX) | no disponible | ídem | 8,7 % | MIT/Apache-2.0 según distribución (no confirmado) | Hugging Face, MLX |

La comparativa se limita a los modelos incluidos en la validación del autor. No se dispone de datos de otros modelos ASR en sueco en la información proporcionada.

## Limitaciones y advertencias

- Las marcas de tiempo a nivel de palabra no se probaron y probablemente no funcionen: el conversor solo configura las cabeceras de alineación para los modelos oficiales de OpenAI.
- Los modelos Whisper pueden alucinar texto ante silencio, ruido o música; conviene revisar las transcripciones que importen.
- Solo se convirtió el tamaño large; no hay versiones small, medium ni turbo en este repositorio.
- El modelo está limitado al sueco; no se garantiza un comportamiento correcto en otros idiomas.
- Es una conversión no oficial, sin soporte ni respaldo de KBLab; el autor declara que no está afiliado ni respaldado por ellos.
- La validación se hizo con una única ejecución sobre 100 clips de habla leída; el rendimiento en audio real (llamadas, reuniones, ruido) será peor.
- El uso comercial está permitido por la licencia Apache-2.0, pero el usuario es responsable de tener una base legal para procesar grabaciones de personas.
- No se documentan sesgos específicos del modelo base en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tibber-se/kb-whisper-large-mlx-4bit
- Modelo base: https://huggingface.co/KBLab/kb-whisper-large
- `mlx-whisper` en PyPI: https://pypi.org/project/mlx-whisper/
- Script de conversión (ml-explore/mlx-examples, whisper/convert.py): https://github.com/ml-explore/mlx-examples
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
