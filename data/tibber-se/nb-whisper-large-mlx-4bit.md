# Tibber-se/nb-whisper-large-mlx-4bit

## Resumen

nb-whisper-large-mlx-4bit es una conversión no oficial del modelo de reconocimiento automático del habla NbAiLab/nb-whisper-large, desarrollado por el laboratorio de IA de la Biblioteca Nacional de Noruega (NbAiLab), a formato MLX con cuantización de 4 bits para su ejecución local en Apple Silicon. Lo publica la organización Tibber-se como utilidad para la comunidad: no está afiliado ni respaldado por NbAiLab y se distribuye sin soporte. El modelo resuelve la transcripción de audio en noruego bokmål manteniendo los pesos y el audio íntegramente en la máquina del usuario.

Técnicamente es un Whisper large (arquitectura transformer encoder-decoder con atención estándar) convertido con la herramienta whisper/convert.py de ml-explore/mlx-examples, con `--dtype float16` y cuantización de 4 bits con group size 64. El repositorio ocupa 0,9 GB y contiene `weights.safetensors` y `config.json`, con los mismos tensores que la salida del conversor. Su relevancia actual radica en que permite transcripción de alta calidad en noruego sobre hardware de consumo Apple sin depender de servicios en la nube.

La validación publicada por el autor es una única ejecución sobre 100 clips del split de test de FLEURS (noruego bokmål): 5,5 % de WER, idéntico al modelo original en fp32 vía transformers y muy por delante de whisper-large-v3-turbo en MLX (10,2 %). Se trata de una comprobación de cordura, no de un benchmark completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large), conversion a MLX |
| Parametros totales | no disponible (corresponde a Whisper large; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper; el autor no la especifica) |
| Tipos de cuantizacion | 4 bits, group size 64, con pesos en float16 |
| Idiomas soportados | Noruego (bokmål, codigo `no`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`weights.safetensors`) + `config.json`, formato MLX |

## Arquitectura y entrenamiento

El modelo subyacente es NbAiLab/nb-whisper-large, un fine-tuning de Whisper large sobre noruego, con la arquitectura encoder-decoder estándar de Whisper (atención densa, sin mecanismos lineales ni decodificación especulativa). Esta ficha no dispone de datos sobre el volumen de tokens, la composición del corpus de entrenamiento ni si hubo RLHF o DPO en el modelo original; esa información correspondería a la model card de NbAiLab, no incluida en el material proporcionado.

La innovación de esta publicación es exclusivamente de despliegue: la conversión se realizó con el script whisper/convert.py de ml-explore/mlx-examples en revisión 796f5b5, ejecutado localmente con `--dtype float16` y `-q --q-bits 4` (group size 64), partiendo de la revisión `8c6249fdeeb4dcd05e5735a4c39640607eb6e4ac` del modelo original. Los tensores son idénticos a los de la salida estándar del conversor (`model.safetensors`), solo renombrados para el loader de `mlx_whisper` de PyPI. No hay reentrenamiento ni ajuste adicional.

## Capacidades

- Reconocimiento automático del habla (ASR) en noruego bokmål, con salida en texto plano y en subtítulos SRT (`-f srt`).
- Transcripción local: los pesos y el audio no salen del equipo.
- Ejecución en Apple Silicon mediante `mlx-whisper`, invocable con `uvx --from mlx-whisper mlx_whisper`.
- Selección explícita de idioma mediante `--language no`.
- No se ha validado el soporte de timestamps a nivel de palabra; el autor advierte de que probablemente no funcione porque el conversor solo configura las cabeceras de alineación para los modelos oficiales de OpenAI.
- No hay soporte documentado de tool calling, agentes, visión, audio de entrada más allá de la transcripción ni modo de razonamiento extendido.

## Casos de uso

- Transcripción de reuniones internas en noruego: el modelo procesa el audio localmente en un Mac con Apple Silicon, lo que evita enviar conversaciones confidenciales a APIs externas y cumple requisitos de privacidad estrictos.
- Generación de subtítulos SRT para vídeo corporativo o formativo en bokmål: la opción `-f srt` de `mlx_whisper` produce directamente el archivo de subtítulos, adecuado para publicar contenido en noruego sin coste por minuto.
- Actas y notas de llamadas de atención al cliente: con un WER del 5,5 % en habla leída limpia, la transcripción sirve como base para resúmenes posteriores, aunque el autor advierte de que llamadas reales puntuarán peor que FLEURS.
- Investigación lingüística y corpus orales: permite transcribir entrevistas o grabaciones de campo en noruego en un portátil, con los datos sujetos al RGPD/GDPR bajo responsabilidad del usuario.
- Prototipado y evaluación de pipelines ASR: al ser una conversión MLX de 4 bits, sirve para comparar calidad frente al modelo original en fp32 con un coste de infraestructura mínimo.
- Accesibilidad: subtitulado automático de material audiovisual en noruego para personas con discapacidad auditiva, ejecutado en estaciones de trabajo Apple sin GPU dedicada.
- Uso en entornos con conectividad limitada: al ejecutarse completamente offline una vez descargados los 0,9 GB del repositorio, es viable en trabajo de campo o en redes aisladas.

## Benchmarks y rendimiento

El autor publica una única medición de WER sobre 100 clips del split de test de FLEURS (noruego bokmål, CC-BY-4.0), en una sola ejecución sobre un Mac con Apple Silicon. La normalización pasa a minúsculas y elimina puntuación, pero no normaliza números.

| Modelo | WER |
|---|---|
| whisper-large-v3-turbo (MLX) | 10,2 % |
| NbAiLab/nb-whisper-large vía transformers (fp32, pesos originales) | 5,5 % |
| nb-whisper-large-mlx-4bit (este modelo) | 5,5 % (mediana por clip 3,5 %, peor clip 29 %) |

El WER de corpus queda a unos 0,3 puntos de los pesos originales. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto, ya que el modelo es exclusivamente ASR. El propio autor califica la medición como comprobación de cordura y no como benchmark.

## Requisitos de hardware

- Hardware obligatorio: Mac con Apple Silicon (requisito de MLX); no funciona en GPU NVIDIA ni CPU x86 con esta librería.
- VRAM/memoria unificada: no disponible de forma explícita; el repositorio pesa 0,9 GB en cuantización de 4 bits, por lo que la huella de pesos es de ese orden y debe caber en memoria unificada junto con el audio y el estado de decodificación.
- GPU recomendadas: cualquier chip Apple Silicon; el autor no especifica modelos concretos ni memoria mínima.
- Cabe en hardware de consumo Apple por diseño (orientado a ejecución local en Mac).
- Despliegue: `mlx-whisper` desde PyPI, invocado con `uvx --from mlx-whisper mlx_whisper`; requiere `ffmpeg` instalado. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor no publica tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS nb (100 clips) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nb-whisper-large-mlx-4bit | no disponible (Whisper large) | no disponible | 5,5 % | Apache-2.0 | MLX, Apple Silicon |
| NbAiLab/nb-whisper-large (original) | no disponible (Whisper large) | no disponible | 5,5 % (fp32, transformers) | Apache-2.0 | Transformers/PyTorch |
| whisper-large-v3-turbo (MLX) | no disponible | no disponible | 10,2 % | no disponible en la informacion | MLX, Apple Silicon |

La comparativa se limita a los tres sistemas medidos por el autor en la misma prueba. No hay datos publicados para otros modelos ASR en noruego dentro de la información disponible.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por NbAiLab y se distribuye sin soporte.
- Timestamps a nivel de palabra no probados y probablemente no funcionales, porque el conversor solo configura las cabeceras de alineación para los modelos oficiales de OpenAI.
- Riesgo de alucinación: como todos los modelos Whisper, puede generar texto sobre silencios, ruido o música; el autor recomienda revisar las transcripciones que importen.
- Solo se ha convertido el tamaño large; no hay versiones small, medium ni turbo en este repositorio.
- El WER de 5,5 % procede de habla leída limpia (FLEURS); reuniones y llamadas reales obtendrán peores resultados, y el peor clip individual alcanza el 29 % de WER.
- La normalización de evaluación no normaliza números, lo que puede afectar a la comparación con otras métricas.
- Restricción de plataforma: requiere Apple Silicon y MLX; no es desplegable en infraestructura NVIDIA ni en servidores x86 convencionales.
- Idioma limitado al noruego bokmål; no hay evidencia de calidad en otros idiomas pese a la base multilingüe de Whisper.
- Responsabilidad legal: si se procesan grabaciones de personas, el usuario debe disponer de base legal conforme al RGPD; el modelo no incluye salvaguardas específicas.
- Licencia Apache-2.0 permite uso comercial, pero al derivar de un modelo de terceros conviene verificar las condiciones del modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tibber-se/nb-whisper-large-mlx-4bit
- Modelo base: https://huggingface.co/NbAiLab/nb-whisper-large
- Librería mlx-whisper en PyPI: https://pypi.org/project/mlx-whisper/
- Script de conversión (ml-explore/mlx-examples, whisper/convert.py): https://github.com/ml-explore/mlx-examples
- Dataset FLEURS: https://huggingface.co/datasets/google/fleurs
