# weathon/DecoyFace

## Resumen

DecoyFace es una implementación en PyTorch de un esquema de protección de privacidad para reconocimiento facial dividido entre cliente y servidor (split face recognition). El modelo separa un backbone IR-50 en dos partes: un codificador cliente (`F_c`) que procesa la imagen en el dispositivo del usuario y un backbone servidor (`F_s`) que completa el reconocimiento en el servidor. El objetivo es que el cliente envíe una representación intermedia protegida que permita al servidor reconocer la identidad legítima sin poder reconstruir la imagen facial original ni realizar reconocimiento no autorizado.

El repositorio incluye los scripts para construir las estadísticas de Reconstruction-Sensitive Subspace Decomposition (RSSD), la bank auxiliar, y para entrenar el backbone servidor. La protección cliente se implementa mediante Decoy-Guided Coherent Mixing (DGCM) y la recuperación servidor mediante el Authorized Canonicalization Module (ACM). El encoder cliente es el stem y stage 1 de AdaFace IR-50 entrenado en MS1MV2 (salida 64×56×56), y el backbone servidor es el resto del IR-50.

Es relevante para investigadores en privacidad de biometría y sistemas de reconocimiento facial distribuidos, ya que aborda el problema de enviar features faciales a un servidor sin exponer la identidad real. No obstante, se trata de un repositorio de investigación con checkpoints incompletos (faltan `proxy_unet.pt` y `defender.pt`), sin licencia declarada ni benchmarks publicados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN IR-50 (ResNet de 50 capas para reconocimiento facial), dividida en ClientEncoder (stem + stage 1) y ServerBackbone (resto del IR-50); incluye una U-Net de inversión proxy para RSSD |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (checkpoints en fp32 y bank auxiliar en fp16) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | `.pth` (PyTorch state dict); bank auxiliar en fp16 |

## Arquitectura y entrenamiento

La arquitectura se basa en IR-50, un ResNet de 50 capas adaptado para reconocimiento facial. El modelo se divide en dos componentes: el `ClientEncoder` (`F_c`), que corresponde al stem y stage 1 del backbone AdaFace IR-50 entrenado en MS1MV2 y produce features de 64×56×56, y el `ServerBackbone` (`F_s`), que contiene el resto de las capas del IR-50. El repositorio incluye además una U-Net de inversión proxy utilizada para estimar la subespacio sensible a la reconstrucción (RSSD).

El entrenamiento se organiza en tres etapas reproducibles: `build_rssd.py` entrena la U-Net de inversión proxy y estima la subespacio sensible a la reconstrucción; `build_bank.py` construye la bank complementaria auxiliar y `mu_rec`; y `train_defender.py` entrena `F_s` junto con una cabeza ArcFace sobre features protegidas y canonicalizadas. Los scripts usan MS1M con carpetas de identidad nombradas por enteros que contienen caras alineadas de 112×112 en `.jpg`. Las identidades empleadas son: primeras 5000 para la U-Net proxy, 50000-60000 para la bank auxiliar y primeras 30000 para el defender. Los scripts registran en Weights & Biases (proyecto `decoyface-repro`).

La innovación técnica principal es el esquema DGCM/ACM: el cliente mezcla de forma coherente la feature de la imagen real con la de una cara señuelo (decoy) de otra identidad, y el servidor aplica una canonicalización autorizada que recupera la información necesaria para el reconocimiento legítimo. La separación en subespacios (RSSD) busca que la representación transmitida sea insensible a la reconstrucción de la imagen original.

## Capacidades

- Extracción de features faciales para reconocimiento de identidad mediante IR-50.
- Protección de privacidad en el cliente: `protect(z_A, z_B)` aplica DGCM mezclando features de la imagen real y de una cara señuelo.
- Recuperación autorizada en el servidor: `server_recover(z_t)` aplica ACM para canonicalizar la feature protegida antes de pasarla a `F_s`.
- Estimación de subespacios sensibles a la reconstrucción mediante una U-Net de inversión proxy (RSSD).
- Construcción de una bank auxiliar complementaria de 5000 features de 64×56×56 en fp16.
- Entrenamiento del backbone servidor con cabeza ArcFace sobre features canonicalizadas.
- No soporta tool calling, agentes, generación de texto ni capacidades multilingües (es un modelo de visión).

## Casos de uso

- Reconocimiento facial con privacidad en el borde: el cliente envía `z_t` en lugar de la imagen o de la feature directa, de modo que el servidor completa el reconocimiento sin recibir la imagen original. Adecuado para sistemas donde el dispositivo del usuario no es de confianza plena.
- Verificación de identidad en aplicaciones móviles: el `ClientEncoder` (stem + stage 1, salida 64×56×56) se ejecuta en el dispositivo y solo se transmite una representación protegida de menor dimensión.
- Investigación en privacidad biométrica: reproducción de las estadísticas RSSD y de la bank auxiliar para evaluar ataques de inversión y reconstrucción sobre features intermedias.
- Evaluación de esquemas split learning para biometría: comparación del esquema DGCM/ACM frente a otras técnicas de protección de features faciales.
- Entrenamiento de backbones servidor con datos protegidos: uso de `train_defender.py` para entrenar `F_s` con cabeza ArcFace sobre features canonicalizadas, útil en pipelines de investigación reproducibles.
- Despliegue en arquitecturas cliente-servidor con ancho de banda limitado: la feature intermedia de 64×56×56 canales es más compacta que la imagen 112×112×3, reduciendo la exposición y el volumen transmitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el repositorio ocupa 2,2 GB y la bank auxiliar es de 5000×64×56×56 en fp16 (aproximadamente 2,1 GB solo para la bank).
- GPU recomendadas: no disponible; el código de ejemplo usa `cuda` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio y la bank auxiliar sugieren que puede requerir más de 8 GB de VRAM, pero no se dispone de datos concretos.
- Opciones de despliegue: el repositorio es PyTorch puro; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros esquemas de reconocimiento facial con privacidad ni con backbones IR-50 alternativos.

## Limitaciones y advertencias

- Checkpoints incompletos: `proxy_unet.pt` y `defender.pt` no están incluidos en el repositorio, por lo que no es posible ejecutar el pipeline completo sin reentrenar.
- Licencia no declarada: no se especifican términos de uso comercial; debe contactarse con el autor antes de cualquier uso en producción.
- Sin benchmarks publicados: no hay métricas de precisión de reconocimiento, tasa de falsos positivos ni resistencia a ataques de inversión en la información disponible.
- Dependencia de MS1M: la reproducción requiere el dataset MS1M con estructura específica de carpetas y caras alineadas de 112×112.
- Riesgo de sesgo: al entrenarse sobre MS1M, hereda los sesgos demográficos de dicho dataset; no se documentan evaluaciones de equidad.
- Es un repositorio de investigación con 0 descargas y 0 likes, sin validación externa conocida.
- El esquema de privacidad no garantiza protección absoluta: la solidez frente a ataques de reconstrucción no está cuantificada en la información disponible.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/weathon/DecoyFace
- AdaFace (origen del backbone IR-50 MS1MV2): https://github.com/mk-minchul/AdaFace
