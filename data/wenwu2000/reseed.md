# Wenwu2000/ReSeed

## Resumen

ReSeed es un método de destilación para modelos de difusión que recupera la diversidad perdida en estudiantes de pocos pasos mediante sesgos residuales aplicados únicamente en el primer paso de denoising. Lo desarrolla Wenwu2000 (repositorio TWWinde/ReSeed) y se publica como un conjunto de adaptadores que se acoplan sobre estudiantes congelados de cuatro pasos, sin modificar sus pesos originales ni los tres pasos finales del proceso de muestreo. El problema que aborda es la pérdida de variedad en las salidas de estudiantes destilados (DMD, DMD2, SenseFlow), que ganan velocidad pero colapsan la distribución de resultados.

El repositorio incluye cuatro adaptadores ReSeed (SD3-Medium, SD3.5-Medium, SenseFlow-FLUX y Wan2.1 DMD2) y dos estudiantes SD3 entrenados por los autores. Los adaptadores son ficheros `residual_biases.pt` con entre 46.080 y 233.472 parámetros de sesgo, no pesos LoRA, y se aplican sobre el primer intervalo de velocidad del profesor. El repositorio completo ocupa 18,2 GB, mayoritariamente por los dos transformadores de estudiante SD3 incluidos.

La relevancia actual reside en que permite mejorar la diversidad de pipelines de generación rápida (4 pasos) sin reentrenar el estudiante ni alterar su latencia, algo crítico para producción en text-to-image y text-to-video. La licencia es heredada de los modelos upstream (Stability AI, Black Forest Labs, Wan-AI), por lo que las restricciones comerciales dependen de cada modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores de sesgo residual sobre transformadores de difusión (SD3, SD3.5, FLUX, Wan2.1) |
| Parámetros totales | No disponible (depende del estudiante base; los adaptadores tienen 46.080-233.472 parámetros de sesgo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelos de difusión; condicionados por prompt de texto) |
| Tipos de cuantización | No disponible (pesos en BF16 según el runtime indicado) |
| Idiomas soportados | No disponible |
| Licencia | `upstream-model-licenses-apply` (ver NOTICE.md; hereda licencias de SD3, FLUX y Wan) |
| Formato de pesos | safetensors (estudiantes) y `.pt` (adaptadores `residual_biases.pt`) |

## Arquitectura y entrenamiento

ReSeed no es un modelo generativo completo, sino una técnica de ajuste post-hoc sobre estudiantes de difusión congelados. El estudiante objetivo es un modelo destilado de cuatro pasos (DMD, DMD2 o SenseFlow) que infiere con FlowMatch Euler a CFG 1. Sobre él se ajustan pequeños sesgos residuales que aproximan la velocidad del profesor en el primer intervalo de denoising; estos sesgos se activan solo en el primer paso y el resto de pasos queda intacto, preservando la velocidad del estudiante.

Los estudiantes SD3-Medium y SD3.5-Medium fueron entrenados por los autores en su código `unified_distill` (CRRA), con semilla 42 y checkpoint-2000, usando como profesores SD3-Medium (28 pasos, CFG 7) y SD3.5-Medium (40 pasos, CFG 4.5). El estudiante de vídeo es el checkpoint público `dmd2_t2v_vipe/0001000` de los autores de Data-Forcing Distillation (entrenado sobre el conjunto ViPE `long`), y el de imagen FLUX es el SenseFlow-FLUX de cuatro pasos publicado por los autores de SenseFlow. Los adaptadores se ajustaron con 300-2100 updates según el caso. No se especifican en la información disponible el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de imagen texto-a-imagen de cuatro pasos con estudiantes SD3-Medium, SD3.5-Medium y SenseFlow-FLUX.
- Generación de vídeo texto-a-vídeo con el estudiante Wan2.1-T2V-1.3B DMD2.
- Mejora de diversidad en las salidas sin sacrificar la latencia de cuatro pasos.
- Compatibilidad con pipelines Diffusers 0.34.0 y PyTorch 2.6.0 en BF16.
- Aplicación selectiva del sesgo solo en el primer paso de denoising, manteniendo el resto del sampler intacto.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de audio; es un componente de generación visual.

## Casos de uso

- Generación de imágenes en producción con SD3-Medium: aplicar el adaptador `adapters/sd3m/seed_42/checkpoint-1900` sobre el estudiante DMD de cuatro pasos para obtener variedad de salidas con la misma latencia, útil en pipelines de contenido a escala.
- Generación de imágenes de alta calidad con SD3.5-Medium: usar `adapters/sd35m/seed_42/checkpoint-2100` para recuperar diversidad en un estudiante destilado con profesor de 40 pasos y CFG 4.5, adecuado para catálogos y creatividades.
- Generación rápida con FLUX: acoplar `adapters/flux/seed_42/checkpoint-2000` sobre SenseFlow-FLUX para mantener la calidad de FLUX.1-dev en cuatro pasos con mayor variedad, útil en herramientas de diseño asistido.
- Vídeo texto-a-vídeo con Wan2.1: aplicar `adapters/wan21/seed_42/checkpoint-300` sobre el checkpoint DMD2 `dmd2_t2v_vipe/0001000` para clips cortos con diversidad mejorada, orientado a previsualización y prototipado de vídeo.
- Investigación en destilación de difusión: usar los adaptadores y manifiestos como referencia reproducible para estudiar el efecto del sesgo de primer paso sobre la diversidad, con pares estudiante-adaptador documentados en `release_manifest.json`.
- Evaluación comparativa de diversidad: emplear los estudiantes SD3 incluidos (checkpoint-2000, semilla 42) como línea base frente a sus versiones con adaptador para medir el impacto en métricas de variedad.
- Integración en pipelines Diffusers existentes: cargar el estudiante y el adaptador correspondiente sin reentrenar, reduciendo el coste de adopción en infraestructuras ya basadas en Diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 18,2 GB y el runtime indicado usa BF16, por lo que se requiere una GPU con al menos suficiente memoria para el estudiante correspondiente en BF16.
- GPU recomendadas: no especificadas en la información disponible; el runtime de referencia emplea CUDA y BF16 (PyTorch 2.6.0).
- Ajuste en GPU de consumo: no confirmado en la información disponible.
- Opciones de despliegue: Diffusers 0.34.0 con PyTorch 2.6.0 y Transformers 4.45.2; descarga vía `huggingface_hub==0.36.2`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusión en este contexto).
- Latencia y throughput: no disponibles; el estudiante opera en cuatro pasos con FlowMatch Euler a CFG 1, lo que reduce el coste frente a samplers de 28-40 pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Parámetros del adaptador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReSeed (SD3-Medium) | Adaptador de diversidad | 4 | 72.192 | Upstream (Stability AI) | HuggingFace, repo público |
| SD3-Medium DMD (estudiante base) | Estudiante destilado | 4 | No aplica | Upstream (Stability AI) | Incluido en el repo |
| SenseFlow-FLUX | Estudiante destilado | 4 | No aplica | Upstream (FLUX.1-dev) | Repo domiso/SenseFlow |
| Wan2.1 DMD2 | Estudiante de vídeo destilado | 4 | No aplica | Upstream (Wan-AI) | Repo csusupergear |

No se dispone de datos de rendimiento comparativo (métricas de diversidad, FID, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Los adaptadores son específicos de cada estudiante: deben usarse con el par exacto indicado en `release_manifest.json`; un emparejamiento incorrecto invalida el resultado.
- No son pesos LoRA: son sesgos residuales de primer paso, por lo que no deben tratarse como adaptadores genéricos.
- Los estudiantes SD3 incluidos son experimentales y no son checkpoints oficiales de DMD2.
- La licencia es heredada de los modelos upstream (Stability AI, Black Forest Labs, Wan-AI), con posibles restricciones comerciales que deben revisarse en NOTICE.md antes de uso en producción.
- Algunos modelos base están sujetos a acceso restringido (gated) y requieren aceptar términos y autenticarse con `hf auth login`.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas en la información disponible.
- El repositorio pesa 18,2 GB, lo que puede complicar su descarga y almacenamiento en entornos limitados.

## Enlaces

- HuggingFace: https://huggingface.co/Wenwu2000/ReSeed
- Paper: https://arxiv.org/abs/2610.37110
- Paper DMD: https://arxiv.org/abs/2311.18828
- Página del proyecto: https://twwinde.github.io/reseed-project-page/
- Código: https://github.com/TWWinde/ReSeed
- NOTICE de licencias: https://github.com/TWWinde/ReSeed/blob/main/NOTICE.md
- DMD2: https://github.com/tianweiy/DMD2
- Data-Forcing Distillation: https://github.com/csy2077/data-forcing-distillation
- Checkpoint Wan2.1 DMD2: https://huggingface.co/csusupergear/wan_t2v_checkpoints_release/tree/main/dmd2_t2v_vipe
- SenseFlow-FLUX: https://huggingface.co/domiso/SenseFlow/tree/main/SenseFlow-FLUX
- SD3-Medium: https://huggingface.co/stabilityai/stable-diffusion-3-medium-diffusers
- SD3.5-Medium: https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Wan2.1-T2V-1.3B: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
