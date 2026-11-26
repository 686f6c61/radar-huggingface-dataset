# wearewaiv/phaet

## Resumen
Phaet es un codificador visual (encoder) especializado en patologia computacional, desarrollado por wearewaiv y publicado en Hugging Face. Se trata de un fine-tuning del modelo base owkin/phikon-v2, un encoder de vision entrenado sobre imagenes histopatologicas, y esta orientado a la extraccion de caracteristicas (embeddings) de imagenes medicas para tareas downstream como clasificacion de tejidos, deteccion de tumores o recuperacion de imagenes similares.

El modelo cuenta con aproximadamente 303 millones de parametros y se distribuye en formato safetensors con codigo personalizado (custom_code), lo que implica que su carga requiere confiar en la implementacion remota del autor. La licencia es "other" y el acceso esta restringido (gated): es necesario aceptar condiciones en Hugging Face antes de poder descargar los pesos, lo que limita su uso directo en pipelines automatizados sin gestion de credenciales.

Su relevancia actual radica en la creciente demanda de encoders especializados en dominios medicos que permitan construir sistemas de analisis de laminas histologicas sin entrenar desde cero. Al partir de Phikon-v2, hereda representaciones entrenadas sobre grandes volumenes de imagenes de patologia, y el fine-tuning busca adaptarlas a un objetivo concreto que no se detalla en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de vision (transformer) basado en owkin/phikon-v2; detalles internos no disponibles |
| Parametros totales | 303.351.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen) |
| Licencia | other (acceso restringido, gated) |
| Formato de pesos | safetensors con custom_code |

## Arquitectura y entrenamiento
La informacion disponible indica que Phaet es un encoder de vision con fine-tuning sobre owkin/phikon-v2, un modelo de la familia Phikon orientado a patologia. La libreria declarada es transformers y el pipeline es image-feature-extraction, lo que confirma que su salida principal son embeddings de imagen en lugar de texto generado. El tag "finetuned_encoder" sugiere que se ha ajustado la torre de vision completa o parte de ella para una tarea especifica.

No se dispone de datos sobre el volumen de tokens o imagenes de entrenamiento, la composicion del dataset de fine-tuning, el uso de tecnicas como RLHF/DPO (poco habituales en encoders) ni innovaciones tecnicas concretas como atencion lineal o decodificacion especulativa. El modelo incluye codigo personalizado, por lo que la arquitectura exacta solo es verificable inspeccionando los archivos del repositorio.

## Capacidades
- Extraccion de caracteristicas (embeddings) de imagenes histopatologicas para tareas downstream.
- Clasificacion de parches o regiones de tejido mediante cabezales entrenados sobre los embeddings.
- Recuperacion de imagenes por similitud (image retrieval) en colecciones de laminas.
- Segmentacion o deteccion aguas abajo si se anaden cabezales adecuados sobre las caracteristicas.
- No es un modelo generativo: no produce texto, codigo ni respuestas conversacionales.
- No dispone de tool calling, function calling ni capacidades de agente.
- Capacidades multilingues no aplicables (modelo puramente visual).
- Modo thinking, vision general, audio: no disponibles.

## Casos de uso
- Analisis de laminas histologicas en investigacion: usar el modelo para extraer embeddings de parches de tejido y entrenar un clasificador ligero de tumores benignos frente a malignos, aprovechando las representaciones preentrenadas en patologia.
- Recuperacion de casos similares: indexar embeddings de un archivo de laminas con FAISS o similar para que patologos localicen imagenes morfologicamente parecidas a un caso nuevo.
- Control de calidad de datasets medicos: detectar duplicados o imagenes atipicas comparando embeddings y distancias coseno antes de entrenar otros modelos.
- Preprocesado para pipelines de IA diagnostica: servir como extractor congelado en una arquitectura en la que un cabezal especifico se entrena con pocos datos etiquetados.
- Investigacion de representaciones: estudiar que caracteristicas morfologicas captura el fine-tuning respecto a Phikon-v2 mediante analisis de vecinos cercanos y visualizacion de embeddings.
- Prototipado de herramientas de triaje: generar embeddings en lote para priorizar laminas con patrones poco frecuentes en revisiones de laboratorio.
- Fine-tuning adicional en dominios concretos: partir de este encoder para adaptarlo a tinciones o tejidos especificos con datasets pequenos, dado que ya esta ajustado sobre Phikon-v2.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en fp32: en torno a 1,2 GB solo para pesos (303 M parametros), mas activaciones; en la practica 2-4 GB para lotes pequenos de imagenes.
- VRAM estimada en fp16/bf16: aproximadamente 0,6-0,7 GB para pesos, con margen adicional para activaciones.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4070, RTX 4090); A100/H100 solo necesarias para procesar grandes volumenes en paralelo.
- Cabe en GPU de consumo: si, en modelos con 8 GB de VRAM en adelante.
- Opciones de despliegue: transformers (con custom_code y trust_remote_code), posible exportacion a ONNX o TorchScript no confirmada; vLLM, llama.cpp, Ollama y TGI no aplican a un encoder visual de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wearewaiv/phaet | 303 M | no aplica (vision) | no disponible | other (gated) | Hugging Face, acceso restringido |
| owkin/phikon-v2 | no disponible | no aplica (vision) | no disponible en esta ficha | no disponible | Hugging Face (modelo base) |
| Otros encoders de patologia | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo de vision especializado: no genera texto ni soporta conversacion, tool calling o agentes.
- Acceso restringido (gated): requiere aceptar condiciones y autenticacion en Hugging Face, lo que complica integraciones automatizadas y CI/CD.
- Licencia "other": las condiciones exactas de uso comercial no se detallan en la informacion disponible; es imprescindible revisarlas antes de cualquier despliegue en produccion.
- Codigo personalizado: la carga exige trust_remote_code, lo que introduce riesgo de seguridad si no se audita el repositorio.
- Dominio medico: sesgos derivados de la distribucion de tinciones, laboratorios y poblaciones del dataset de entrenamiento; no se dispone de informacion sobre su composicion.
- Riesgo de generalizacion limitada: al ser un fine-tuning, puede rendir peor fuera de la tarea y dominio para los que fue ajustado.
- No apto como dispositivo medico: no se dispone de validacion clinica ni de resultados de benchmarks que respalden uso diagnostico.
- Riesgo de alucinacion no aplica directamente por no ser generativo, pero los embeddings pueden inducir clasificaciones erroneas si se usan cabezales mal calibrados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/wearewaiv/phaet
- Modelo base: https://huggingface.co/owkin/phikon-v2
- Referencia arXiv citada en tags: arxiv:2607.22861 (identificador presente en los tags; no verificado)
