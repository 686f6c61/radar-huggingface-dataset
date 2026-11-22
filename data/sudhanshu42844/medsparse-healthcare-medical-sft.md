# sudhanshu42844/medsparse-healthcare-medical-sft

## Resumen

MedSparse Healthcare Medical SFT es un modelo de lenguaje causal de tipo Mixture-of-Experts disperso, inspirado en la arquitectura de Mixtral pero desarrollado desde cero por el autor sudhanshu42844, sin reutilizar pesos de los modelos oficiales de Mistral AI. Se trata de un modelo de escala muy reducida, con 38.779.008 parámetros totales, 4 capas transformer, dimensión oculta de 384 y 4 expertos por bloque con enrutamiento top-2 por token. Su propósito es servir como plataforma de investigación para el ajuste supervisado de instrucciones en dominio médico y el estudio de la especialización de expertos en arquitecturas MoE.

El modelo representa la segunda etapa de un proyecto de entrenamiento desde cero: primero se preentrenó sobre documentos sanitarios partiendo de inicialización aleatoria y después se aplicó un ajuste fino supervisado de todos los parámetros sobre el conjunto de datos FreedomIntelligence/medical-o1-reasoning-SFT. No emplea adaptadores LoRA ni pesos congelados, y el checkpoint exportado corresponde a 2.000 pasos de optimizador completados.

Su relevancia es fundamentalmente metodológica: documenta de forma explícita la linaje de checkpoints, el formato de datos de instrucción, el enmascaramiento de pérdida solo en la completación y las limitaciones de evaluación. No es un modelo apto para uso clínico ni para producción sanitaria, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con Mixture-of-Experts disperso (inspirado en Mixtral) |
| Parametros totales | 38.779.008 |
| Parametros activos | 4 expertos por bloque, top-2 por token (no se especifica el recuento activo exacto) |
| Longitud de contexto | 2048 tokens configurados (entrenado con secuencias de 128 tokens en SFT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, tokenizer.json) |
| Capas transformer | 4 |
| Dimension oculta | 384 |
| Cabezas query / KV | 6 / 2 |
| Dimension intermedia de experto | 768 |
| Pasos de optimizador exportados | 2000 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer causal con capas MoE dispersas: cada bloque contiene 4 expertos y cada token activa los 2 mejor puntuados por el router. La configuración incluye 4 capas, dimensión oculta de 384, 6 cabezas de consulta y 2 de clave-valor (atención con cabezas KV compartidas), y una dimensión intermedia de experto de 768. La longitud máxima de posición configurada es de 2048 tokens, aunque el ajuste supervisado se realizó con secuencias de solo 128 tokens, lo que limita en la práctica la capacidad de contexto real.

El entrenamiento se articula en dos etapas: un preentrenamiento desde inicialización aleatoria sobre documentos del dominio sanitario (checkpoint base `medsparse-healthcare-pretrained-from-scratch`) y un ajuste fino supervisado de todos los parámetros, incluidos embeddings, proyecciones de atención, routers, expertos, layer norms y la cabeza LM, con un optimizador AdamW nuevo. El conjunto de datos documentado es FreedomIntelligence/medical-o1-reasoning-SFT en configuración inglesa, usando los campos `Question` y `Response` (el campo `Complex_CoT` no se usa como objetivo). El formato emplea secciones `### System:`, `### User:` y `### Assistant:`, con pérdida calculada únicamente sobre la completación (los tokens de sistema y usuario se enmascaran con -100) y una penalización de balanceo de carga de expertos añadida por el modelo. La partición de validación se hizo por hash de pregunta, aunque el autor advierte de posibles duplicados y contaminación del conjunto original.

## Capacidades

- Generación de texto causal en inglés con arquitectura MoE dispersa.
- Ajuste a formato de instrucciones conversacionales con secciones de sistema, usuario y asistente.
- Razonamiento médico básico a nivel de investigación, derivado del conjunto de datos de instrucciones sanitarias.
- Enrutamiento condicional por token a través de expertos especializados (top-2 de 4).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso más allá del formato de instrucción.
- Capacidad multilingüe limitada al inglés.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.
- No es compatible con `AutoModelForCausalLM` de Transformers; requiere el paquete propio `mixtral_lab.MixtralLM` y el script `load_model.py` incluido.

## Casos de uso

- Investigación en ajuste fino de peso completo sobre arquitecturas MoE: el modelo permite estudiar cómo se comportan los routers y expertos tras un SFT completo, gracias a su linaje documentado y a la separación explícita entre checkpoints de preentrenamiento y SFT.
- Demostración técnica de linaje de checkpoints: útil para reproducir y auditar el flujo preentrenamiento desde cero, carga de pesos en la misma arquitectura e inicialización de un nuevo optimizador para la segunda etapa.
- Evaluación offline de instrucciones médicas no identificativas: el modelo puede emplearse en entornos controlados para probar formatos de prompt con secciones de sistema, usuario y asistente y medir perplejidad sobre completaciones enmascaradas.
- Estudio de especialización de expertos en dominio sanitario: con 4 expertos y top-2 por token, sirve como banco de pruebas de bajo coste para analizar el balanceo de carga y la distribución de activaciones.
- Docencia y experimentación con transformers personalizados: su implementación nativa en PyTorch y su reducido tamaño (0,2 GB, 38,8 M de parámetros) permiten ejecutarlo en entornos educativos sin infraestructura GPU dedicada.
- Pruebas de pipelines de evaluación con pérdida solo en completación: útil para validar metodologías de enmascaramiento de etiquetas y partición por hash de pregunta antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta métricas de desarrollo de entropía cruzada y perplejidad sobre la validación del SFT, que no constituyen una medida de competencia clínica ni son comparables con benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (38,8 M de parámetros en fp32 ocupan aproximadamente 155 MB; en fp16, unos 78 MB), más el overhead del runtime de PyTorch.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Funciona en CPU sin problemas.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) e incluso en entornos sin GPU.
- Opciones de despliegue: no es compatible con vLLM, TGI ni llama.cpp de forma nativa, ya que no es un checkpoint `AutoModelForCausalLM`. El despliegue documentado se realiza con el paquete propio `mixtral_lab` y el script `load_model.py`, instalando `torch`, `safetensors`, `tokenizers` y `huggingface_hub`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja en CPU y GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedSparse Healthcare Medical SFT | 38,8 M | 2048 configurados (128 en SFT) | MoE disperso, 4 capas | Apache 2.0 | Hugging Face, requiere runtime propio |
| Mixtral 8x7B (Mistral AI) | 46,7 B totales, ~12,9 B activos | 32.768 | MoE disperso, 32 capas | Apache 2.0 | Hugging Face, Transformers/vLLM |
| TinyLlama 1.1B | 1,1 B | 2048 | Transformer denso | Apache 2.0 | Hugging Face, Transformers/llama.cpp |
| Phi-2 | 2,7 B | 2048 | Transformer denso | MIT | Hugging Face, Transformers |

La comparación es asimétrica por escala: MedSparse es dos órdenes de magnitud menor que TinyLlama y tres que Mixtral. Su interés no es competitivo en rendimiento, sino metodológico, al ser un MoE entrenado desde cero y ajustado con peso completo sobre datos médicos. No se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Modelo exclusivamente de investigación: no apto para decisiones clínicas, diagnóstico, tratamiento, triaje de pacientes ni dosificación de medicamentos.
- La corrección médica y la seguridad no han sido establecidas por el autor.
- Riesgo elevado de alucinaciones, exceso de confianza, omisiones y respuestas potencialmente dañinas.
- El conjunto de datos de ajuste puede contener respuestas sintéticas, razonamientos no respaldados, errores o conocimiento sanitario desactualizado.
- No se han verificado de forma independiente benchmarks de seguridad clínica, precisión, robustez, equidad, privacidad de pacientes ni seguridad de medicamentos.
- La longitud de contexto configurada (2048) no está validada clínicamente y el entrenamiento se hizo con secuencias de 128 tokens, por lo que la capacidad de contexto largo no está demostrada.
- Limitación idiomática al inglés.
- El conjunto de datos original y las fuentes upstream deben auditarse en cuanto a licencias, privacidad e integridad factual; pueden existir duplicados o contaminación.
- Antes de cualquier uso más allá de la investigación, deben verificarse riesgos de filtración de PHI y memorización de datos.
- No es un checkpoint estándar de Transformers: requiere el paquete `mixtral_lab` y el script incluido, lo que limita su integración en ecosistemas estándar.
- Licencia Apache 2.0 permite uso comercial, pero las advertencias del autor y la falta de validación clínica desaconsejan cualquier despliegue sanitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudhanshu42844/medsparse-healthcare-medical-sft
- Modelo base (preentrenamiento): https://huggingface.co/sudhanshu42844/medsparse-healthcare-pretrained-from-scratch
- Repositorio del proyecto: https://github.com/su394611-del/MedSparse-Healthcare-LLM-From-Scratch
- Conjunto de datos de SFT: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
