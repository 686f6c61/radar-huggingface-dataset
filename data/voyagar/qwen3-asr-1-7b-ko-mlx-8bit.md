# voyagar/Qwen3-ASR-1.7B-ko-mlx-8bit

## Resumen

Qwen3-ASR-1.7B-ko-mlx-8bit es una conversión cuantizada a 8 bits en formato MLX del modelo de reconocimiento automático de voz TeamUNIVA/qwen3_asr_1.7b_ko, un ajuste fino al coreano del Qwen3-ASR-1.7B original de Qwen. El repositorio lo publica el usuario voyagar y su aportación se limita exclusivamente a la cuantización; el entrenamiento y el ajuste lingüístico corresponden a TeamUNIVA y al equipo de Qwen. Está pensado para ejecutarse en hardware Apple Silicon mediante la librería mlx-audio.

El modelo resuelve la transcripción de audio a texto en coreano con un tamaño manejable: 2.038.052.480 parámetros reales según los pesos en safetensors, lo que lo sitúa en la franja de los 2.000 millones. Frente al original en bf16 (4,7 GB), esta versión ocupa 2,5 GB, aproximadamente un 47 % menos, y según el autor es un 30 % más rápida en inferencia.

Su relevancia es práctica: permite desplegar ASR coreano de calidad en un portátil o estación de trabajo con chip de Apple sin depender de GPU dedicadas ni de servicios en la nube. La licencia Apache-2.0, heredada del modelo base, facilita su uso comercial, aunque la validación de calidad publicada por el autor es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3-ASR; no se detalla en la información proporcionada) |
| Parametros totales | 2.038.052.480 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, affine, group size 64 (formato MLX) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX); tamaño del repo 2,5 GB |

## Arquitectura y entrenamiento

No se dispone de detalles arquitectónicos en la información proporcionada más allá de que se trata de un modelo de la familia Qwen3-ASR, especializado en reconocimiento automático de voz, y de que el checkpoint base es un ajuste fino al coreano realizado por TeamUNIVA sobre Qwen/Qwen3-ASR-1.7B (revisión `3e66f586033753589c3effeb2c8cbce46a1ddabb`). No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica documentada de este repositorio es la cuantización: se aplicó `mlx_audio.convert` con `--q-bits 8 --q-group-size 64 --q-mode affine --model-domain stt`, la misma configuración que mlx-community/Qwen3-ASR-1.7B-8bit, generando un archivo de pesos de 2.463.307.541 bytes. No se describe ninguna modificación estructural del modelo, decodificación especulativa ni atención lineal.

## Capacidades

- Reconocimiento automático de voz (speech-to-text) en coreano, con salida de texto a partir de archivos de audio.
- Detección automática de idioma disponible, aunque el autor advierte que falla con frecuencia en audio coreano (ver limitaciones).
- Selección explícita de idioma mediante el parámetro `language` (por ejemplo, `language="Korean"`).
- Ejecución local en Apple Silicon a través de mlx-audio.
- No se documentan capacidades de traducción, diarización de hablantes, marcas de tiempo, tool calling, agentes ni procesamiento multimodal más allá del audio.

## Casos de uso

- Transcripción de reuniones en coreano: el autor validó el modelo precisamente sobre una reunión de 5 minutos, con una diferencia de CER de 2,5 puntos porcentuales respecto al bf16, lo que lo hace adecuado para actas y resúmenes internos en entornos con hardware Apple.
- Subtitulado de contenido audiovisual coreano: al ejecutarse localmente con mlx-audio, permite generar subtítulos sin enviar el audio a servicios externos, útil por confidencialidad y coste.
- Prototipado en portátiles Mac: con 2,5 GB de pesos y un 30 % más de velocidad que bf16, es viable en un MacBook para iterar sobre pipelines de ASR sin GPU dedicada.
- Investigación en ASR coreano: sirve como punto de comparación cuantizado de un fine-tune coreano de Qwen3-ASR, por ejemplo para estudiar la degradación introducida por la cuantización de 8 bits.
- Preprocesado de corpus de audio en coreano: transcripción por lotes de grabaciones para construir datasets de texto o para indexación y búsqueda sobre archivos de voz.
- Asistentes de voz locales para coreano: integrado en una aplicación de escritorio o móvil con backend MLX, permite dictado y comandos por voz sin conexión.
- Evaluación de la viabilidad de MLX en producción: útil para equipos que valoran migrar cargas de ASR a Apple Silicon y necesitan medir velocidad y calidad antes de comprometerse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se evaluó con FLEURS, HiKE ni AI Hub, y que la única comprobación fue una comparación cualitativa sobre una reunión coreana de 5 minutos.

| Metrica | Valor reportado por el autor |
|---|---|
| Diferencia de CER frente a bf16 | 2,5 puntos porcentuales |
| Bucles de repetición | ninguno observado |
| Velocidad frente a bf16 | aproximadamente 30 % más rápido |
| Tamano de pesos | 4,7 GB (bf16) → 2,5 GB (8 bits) |
| Benchmarks publicos (FLEURS, HiKE, AI Hub) | no ejecutados |

## Requisitos de hardware

- VRAM/unified memory estimada: los pesos ocupan 2,5 GB; con overhead de runtime es razonable reservar entre 3,5 y 5 GB de memoria unificada.
- Hardware objetivo: chips de Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra), dado que la librería es MLX.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas por esta conversión concreta; requerirían otro formato de pesos o el modelo base.
- Cabe en GPU de consumo de Apple: sí, en cualquier Mac con al menos 8 GB de memoria unificada, con margen más cómodo a partir de 16 GB.
- Despliegue: mlx-audio (carga mediante `mlx_audio.stt.utils.load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta conversión.
- Latencia y throughput: no disponibles como cifras absolutas; solo se conoce la mejora relativa del 30 % frente a bf16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| voyagar/Qwen3-ASR-1.7B-ko-mlx-8bit | 2.038.052.480 | no disponible | coreano | Apache-2.0 | safetensors MLX 8 bits | Esta ficha; cuantizado, 2,5 GB |
| TeamUNIVA/qwen3_asr_1.7b_ko | no disponible | no disponible | coreano | Apache-2.0 | no disponible | Modelo base en bf16, 4,7 GB, referencia de calidad |
| mlx-community/Qwen3-ASR-1.7B-8bit | no disponible | no disponible | no disponible (modelo original, presumiblemente multilingüe) | no disponible | safetensors MLX 8 bits | Misma configuración de cuantización, sin ajuste coreano |
| Qwen/Qwen3-ASR-1.7B | no disponible | no disponible | no disponible | no disponible | no disponible | Modelo original de Qwen previo al fine-tune coreano |

No se dispone de datos de rendimiento comparativo entre estas variantes; la única referencia cuantitativa es la diferencia de 2,5 puntos de CER entre esta versión y el bf16 del mismo fine-tune.

## Limitaciones y advertencias

- La validación de calidad es mínima: una sola muestra de 5 minutos, sin benchmarks públicos, por lo que no hay garantías sobre el comportamiento en dominios acústicos distintos (ruido, acentos regionales, llamadas telefónicas).
- La detección automática de idioma es poco fiable: el autor reporta que a veces identifica inglés y devuelve texto vacío con audio coreano; conviene fijar `language="Korean"` o reintentar en coreano si la salida está vacía.
- Modelo monolingüe en la práctica: solo declara coreano, aunque el modelo original de Qwen probablemente sea multilingüe; no se documenta el comportamiento en otros idiomas.
- Riesgo de alucinación y errores de transcripción inherentes a los modelos ASR, agravado por la cuantización de 8 bits (2,5 puntos de CER adicionales en la muestra evaluada).
- Sesgos: no se documentan análisis de sesgo por acento, género, edad ni dialecto del coreano.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base de Qwen y del fine-tune de TeamUNIVA antes de desplegar en producción.
- Dependencia de plataforma: solo funciona en el ecosistema MLX (Apple Silicon); no es portable a CUDA sin reconversión.
- Repositorio con muy poca tracción (28 descargas, 0 likes) y sin mantenimiento documentado; tratar como artefacto experimental.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/voyagar/Qwen3-ASR-1.7B-ko-mlx-8bit
- Modelo base (fine-tune coreano): https://huggingface.co/TeamUNIVA/qwen3_asr_1.7b_ko
- Librería mlx-audio: https://github.com/Blaizzy/mlx-audio
