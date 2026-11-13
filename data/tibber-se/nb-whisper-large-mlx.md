# Tibber-se/nb-whisper-large-mlx

## Resumen

NB-Whisper large es un modelo de reconocimiento automático del habla (ASR) desarrollado por NbAiLab, el laboratorio de IA de la Biblioteca Nacional de Noruega, especializado en transcripción de noruego. Esta ficha describe la conversión no oficial a formato MLX en precisión fp16 publicada por la organización Tibber-se, pensada para ejecutar el modelo localmente en Macs con Apple Silicon mediante la librería `mlx-whisper`. La conversión no está afiliada ni respaldada por NbAiLab y se distribuye sin soporte.

El modelo subyacente es un Whisper large (arquitectura transformer encoder-decoder de OpenAI) afinado por NbAiLab sobre datos de noruego, con licencia Apache-2.0. La conversión MLX mantiene los mismos tensores que los pesos originales, únicamente reempaquetados en `weights.safetensors` y un `config.json` para que el cargador de `mlx-whisper` los reconozca. El repositorio ocupa 3,1 GB.

Su relevancia es práctica: permite transcripción de audio en noruego íntegramente en local sobre hardware Apple, sin enviar grabaciones a servicios en la nube. El autor reporta un WER del 5,6 % en 100 clips del split de test de FLEURS (noruego bokmål), prácticamente idéntico al 5,5 % de los pesos originales evaluados con `transformers` en fp32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large) |
| Parametros totales | no disponible (el modelo base es Whisper large; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, propia de Whisper; el autor no lo explicita) |
| Tipos de cuantizacion | fp16 (única variante publicada) |
| Idiomas soportados | noruego (`no`, bokmål) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`weights.safetensors`) + `config.json`, formato MLX |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large: un transformer encoder-decoder entrenado para transcripción y traducción de voz, que procesa audio en ventanas de 30 segundos convertidas a espectrogramas mel. La conversión MLX no modifica la arquitectura ni los pesos: el autor indica que `weights.safetensors` contiene los mismos tensores que la salida del script de conversión de `ml-explore/mlx-examples` (`whisper/convert.py`), ejecutado con `--dtype float16` sobre la revisión `8c6249fdeeb4dcd05e5735a4c39640607eb6e4ac` de `NbAiLab/nb-whisper-large`.

No se dispone de información sobre el proceso de entrenamiento original de NbAiLab en la documentación proporcionada (número de tokens, composición del corpus, uso de RLHF o DPO). El único dato de evaluación es el WER descrito en la sección de benchmarks. La innovación técnica de esta publicación es exclusivamente el empaquetado para Apple Silicon vía MLX, no cambios en el modelo.

## Capacidades

- Transcripción de voz a texto en noruego bokmål.
- Generación de subtítulos en formato SRT mediante la opción `-f srt` de `mlx-whisper`.
- Ejecución local en Apple Silicon: los pesos y el audio permanecen en la máquina.
- Procesamiento por segmentos de audio de 30 segundos, propio de la familia Whisper.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del noruego.
- No se documentan marcas de tiempo a nivel de palabra: el autor indica que no se probaron y probablemente no funcionen, porque el conversor solo configura las cabezas de alineación para los modelos oficiales de OpenAI.

## Casos de uso

- Transcripción de reuniones internas en noruego: el modelo convierte grabaciones en texto sin salir del portátil, lo que simplifica el cumplimiento de protección de datos en entornos corporativos.
- Generación de subtítulos para vídeo corporativo o formación interna en bokmål: la salida directa en SRT permite integrarla en un pipeline de publicación sin pasos manuales de formato.
- Actas y notas de entrevistas: investigadores que trabajan con entrevistas en noruego pueden transcribir localmente en un Mac y revisar después el texto, con el WER de referencia del 5,6 % en habla leída limpia.
- Prototipado de asistentes de voz en noruego: sirve como componente ASR en una demo local antes de decidir un despliegue en producción con infraestructura dedicada.
- Archivística y documentación: digitalización de audio histórico o administrativo en noruego con revisión humana posterior, dado el riesgo de alucinación en silencios y ruido.
- Evaluación comparativa de ASR en Apple Silicon: útil para medir latencia y calidad frente a `whisper-large-v3-turbo` en MLX sobre el mismo hardware, como hace el propio autor con FLEURS.

## Benchmarks y rendimiento

Evaluación del autor sobre 100 clips del split de test de FLEURS (noruego bokmål, CC-BY-4.0), una sola ejecución en un Mac con Apple Silicon. Normalización: minúsculas y eliminación de puntuación, sin normalizar números.

| Modelo | WER |
|---|---|
| `whisper-large-v3-turbo` (MLX) | 10,2 % |
| `NbAiLab/nb-whisper-large` vía `transformers` (fp32, pesos originales) | 5,5 % |
| **Este modelo (MLX fp16)** | **5,6 %** (mediana por clip 3,9 %, peor clip 29 %) |

El autor advierte que FLEURS es habla leída limpia, por lo que reuniones y llamadas reales obtendrán peores resultados, y que una única ejecución sobre 100 clips es una comprobación de sanidad, no un benchmark formal.

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple Silicon; la librería `mlx-whisper` no funciona en otras plataformas.
- Dependencia adicional: `ffmpeg` instalado en el sistema.
- VRAM/memoria unificada: no disponible de forma explícita; el repositorio pesa 3,1 GB en fp16, por lo que se necesita memoria unificada suficiente para cargar los pesos más el audio en proceso.
- GPU recomendadas: no aplica (no usa CUDA); el autor no especifica modelos de chip Apple concretos.
- Despliegue: `uvx --from mlx-whisper mlx_whisper recording.m4a --model Tibber-se/nb-whisper-large-mlx --language no -f srt`.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible; el formato MLX y la tarea ASR quedan fuera de esos motores en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS (no) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (MLX fp16) | Whisper large (recuento no disponible) | no disponible | 5,6 % | Apache-2.0 | Hugging Face, MLX |
| `NbAiLab/nb-whisper-large` (original) | Whisper large (recuento no disponible) | no disponible | 5,5 % (fp32, `transformers`) | Apache-2.0 | Hugging Face |
| `whisper-large-v3-turbo` (MLX) | no disponible | no disponible | 10,2 % | no disponible en la información aportada | MLX |

La comparativa se limita a los datos publicados por el autor; no se dispone de cifras de otros sistemas ASR en noruego para ampliarla.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por NbAiLab y se distribuye sin soporte.
- Marcas de tiempo a nivel de palabra no probadas y probablemente no funcionales, por limitación del conversor.
- Riesgo de alucinación de texto en silencios, ruido o música; hay que revisar las transcripciones que importen.
- Solo se convirtió el tamaño large; no hay variantes small, medium ni turbo en este repositorio.
- El WER de referencia procede de habla leída limpia; en audio real será peor.
- Uso comercial permitido por la licencia Apache-2.0, pero el usuario es responsable de tener base legal para procesar grabaciones de personas.
- Sesgos: no documentados en la información disponible.
- Dependencia de hardware Apple Silicon y de `ffmpeg`; no hay ruta de despliegue en servidores con GPU NVIDIA documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tibber-se/nb-whisper-large-mlx
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-large
- Librería `mlx-whisper`: https://pypi.org/project/mlx-whisper/
- Script de conversión (ml-explore/mlx-examples, `whisper/convert.py`): https://github.com/ml-explore/mlx-examples
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
