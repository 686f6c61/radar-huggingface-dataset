# valereseach/vela-flux-schnell-vir

## Resumen

Vela flux schnell vir es una conversión compacta del modelo de generación de imágenes FLUX.1-schnell de Black Forest Labs, publicada por el usuario valereseach bajo el identificador `valereseach/vela-flux-schnell-vir`. No se trata de un checkpoint estándar de Diffusers, sino de un artefacto en formato VIR (propio del ecosistema Vela) pensado para los mineros en C++ de esa red. El modelo base es FLUX.1-schnell, un transformer de difusión de tipo flow matching especializado en text-to-image con generación en pocos pasos.

La conversión aplica cuantización w8a16 (pesos de 8 bits, activaciones de 16 bits) y reduce la resolución de trabajo a 224×224 con un único paso de inferencia, lo que la aleja del uso generalista y la orienta a un pipeline de minado con verificación criptográfica ligera (zkml-lite q=2). El resultado es un fichero único de 16,9 GB con forma latente de 16×28×28, identificado en el registro de Vela con el id 257.

Su relevancia es acotada: es un artefacto de testnet4, no una activación de mainnet ni una promesa de compatibilidad universal, y el propio autor advierte de que no es un sustituto directo de los pesos originales. Para desarrolladores e investigadores resulta útil como referencia de cómo se empaqueta y cuantiza un modelo de difusión para un entorno de minado descentralizado, más que como modelo de generación de imágenes de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (flow matching) derivado de FLUX.1-schnell; empaquetado en formato VIR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | no disponible (prompts de texto; el modelo base soporta principalmente inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | VIR (`flux-schnell-w8a16-224-1step-compact.vir`), no compatible con Diffusers |
| Resolucion de generacion | 224×224 |
| Pasos de inferencia | 1 |
| Forma latente | 16 × 28 × 28 |
| Tamano del fichero | 16.907.889.856 bytes (16,9 GB) |
| SHA-256 del fichero | `4a3db871e831ae4e467fc1451f4107affda1fa4eac52e6af358ae89a9e52f33d` |
| ID de registro Vela | 257 |
| Hash de registro Vela | `035b0f742eacf936a022fafa8122c11539f7c42e02b07a4229bc05b700fda062` |

## Arquitectura y entrenamiento

El modelo base, FLUX.1-schnell, es un transformer de difusión basado en flow matching entrenado para generar imágenes a partir de texto en un número reducido de pasos. Esta conversión no reentrena el modelo: parte de los pesos de FLUX.1-schnell, los cuantiza a w8a16 y los empaqueta en el formato VIR propietario de Vela, con una configuración de un solo paso y resolución fija de 224×224. La forma latente resultante es de 16×28×28, coherente con esa resolución reducida frente a las resoluciones nativas del modelo original.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre procesos de RLHF o DPO, ya que la model card se limita a describir el proceso de conversión y empaquetado. La innovación técnica destacable no está en el modelo en sí, sino en el contenedor: un fichero único verificable mediante hash de registro y diseñado para integrarse en el esquema de verificación zkml-lite q=2 de Vela, que el autor describe explícitamente como un diseño de muestreo débil y no como un zk-SNARK completo.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en un solo paso de inferencia.
- Resolución de salida fija de 224×224, adecuada para pipelines de minado y verificación, no para producción gráfica de alta resolución.
- Cuantización w8a16 orientada a reducir huella de memoria frente al modelo original en precisión completa.
- Integración con mineros en C++ de Vela mediante el formato VIR y el identificador de registro 257.
- Verificación de integridad mediante hash de registro y SHA-256 del fichero completo.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo de difusión, no un LLM.
- Capacidades multilingües: no documentadas; hereda el comportamiento del modelo base, orientado a prompts en inglés.
- No dispone de modo thinking, visión de entrada ni audio.

## Casos de uso

- Minado en testnet4 de Vela: el fichero se carga en los mineros C++ de la red para ejecutar inferencias de un paso y participar en el esquema de verificación zkml-lite q=2; es su propósito principal y el único documentado por el autor.
- Validación de artefactos en registro: un validador puede comprobar la integridad del modelo cotejando el hash de registro `035b0f...` y el SHA-256 del fichero, útil en pipelines de auditoría de artefactos descentralizados.
- Pruebas de integración de mineros: desarrolladores que implementan o mantienen mineros en C++ pueden usar este VIR como fixture de prueba para validar la carga de modelos cuantizados w8a16 con forma latente 16×28×28.
- Estudio de cuantización para difusión: investigadores interesados en el impacto de w8a16 y la reducción a un paso sobre FLUX.1-schnell pueden analizar este artefacto como caso concreto, aunque sin acceso a métricas de calidad publicadas.
- Referencia de empaquetado VIR: equipos que diseñan sus propios contenedores de modelos verificables pueden tomar este fichero como ejemplo de estructura (fichero único, hash de registro separado del SHA-256, identificador numérico).
- Despliegue en hardware de gama alta para pruebas: con una RTX 4090 de 24 GB se puede ejecutar el modelo según el autor, lo que permite montar un entorno de pruebas local para el pipeline de minado sin depender de infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: el autor indica que el modelo completo requiere más de 16 GB de VRAM disponibles.
- GPU validadas: RTX 4090 con 24 GB, según la model card.
- GPU no soportadas: el autor señala explícitamente que no es apto para tarjetas de 16 GB como la RTX 5060 Ti.
- Cabe en GPU de consumo: sí, en modelos con 24 GB o más (RTX 4090, y por capacidad equivalente otras tarjetas de 24 GB), no en tarjetas de 16 GB.
- Opciones de despliegue: mineros en C++ de Vela con soporte del formato VIR; no es compatible con vLLM, llama.cpp, Ollama, TGI ni Diffusers, al no ser un checkpoint estándar.
- Latencia y throughput: no disponibles; la configuración de un solo paso sugiere una inferencia más rápida que el modelo base multi-paso, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Resolucion / pasos | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vela-flux-schnell-vir | Difusión cuantizada w8a16, formato VIR | no disponible | 224×224, 1 paso | VIR (16,9 GB) | Apache 2.0 | Hugging Face, uso restringido a mineros Vela |
| FLUX.1-schnell (base) | Difusión flow matching | no disponible en la informacion | Resolución nativa, pocos pasos | Safetensors / Diffusers | Apache 2.0 | Hugging Face, uso general |
| Otros derivados cuantizados de FLUX.1-schnell | Difusión cuantizada | no disponible | Variable | GGUF, safetensors cuantizado | Apache 2.0 (heredada) | Hugging Face, ecosistema Diffusers/ComfyUI |

La comparación directa con alternativas del mismo tamaño no es posible con los datos disponibles: no se publican parámetros totales ni métricas de calidad para este artefacto, y su formato propietario lo excluye de los ecosistemas estándar de inferencia, lo que limita la comparabilidad frente a derivados cuantizados convencionales de FLUX.1-schnell.

## Limitaciones y advertencias

- No es un checkpoint compatible con Diffusers: no puede cargarse en pipelines estándar de generación de imágenes.
- Resolución fija de 224×224 y un solo paso: la calidad de salida será inferior a la del FLUX.1-schnell original y no es adecuada para producción gráfica.
- Artefacto de testnet4: el autor advierte de que no constituye una activación de mainnet ni una promesa de compatibilidad universal de modelos.
- zkml-lite q=2 es un diseño de muestreo débil, no un zk-SNARK completo; no debe interpretarse como garantía criptográfica fuerte.
- El hash de registro no coincide con el SHA-256 del fichero completo; confundirlos invalida cualquier verificación de integridad.
- Los validadores deben usar el esqueleto autenticado por separado, no este fichero completo.
- Requiere más de 16 GB de VRAM; no funciona en tarjetas de 16 GB.
- Licencia Apache 2.0, pero los pesos conservan la licencia y términos originales del modelo base; conviene revisar las condiciones de FLUX.1-schnell antes de cualquier uso comercial.
- Sin datos publicados sobre sesgos, tasa de alucinación visual ni calidad de generación; no hay benchmarks que permitan evaluar el impacto de la cuantización.
- Idiomas soportados no documentados; los prompts en castellano pueden rendir peor que en inglés, según el comportamiento típico del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/valereseach/vela-flux-schnell-vir
- Modelo base FLUX.1-schnell: https://huggingface.co/black-forest-labs/FLUX.1-schnell
