# sudhanshu42844/mixtral-healthcare-medical-sft

## Resumen

`mixtral-healthcare-medical-sft` es un modelo de generacion de texto especializado en dominio medico y sanitario, publicado por el usuario sudhanshu42844 en Hugging Face. Se presenta como un ajuste fino supervisado (SFT) completo sobre un modelo base entrenado desde cero por el mismo autor (`sudhanshu42844/mixtral-healthcare-pretrained-from-scratch`), siguiendo un estilo arquitectonico inspirado en Mixtral (mixture-of-experts disperso). El modelo esta etiquetado para generacion de texto en ingles y se ha ajustado sobre el dataset `FreedomIntelligence/medical-o1-reasoning-SFT`.

El dato mas relevante para evaluar su utilidad practica es el recuento real de parametros en los pesos safetensors: 38.779.008 parametros, es decir, aproximadamente 38,8 millones. Esto lo situa muy lejos de un Mixtral real (que ronda los 47.000 millones de parametros totales) y lo acerca mas al tamano de un modelo pequeno tipo GPT-2 o similar. El nombre "mixtral-style" debe interpretarse, por tanto, como una referencia a la topologia MoE, no al orden de magnitud del modelo.

El modelo tiene acceso restringido (gated) en Hugging Face, no declara licencia y no registra descargas ni interacciones en el momento de la consulta. Es un artefacto experimental de un autor individual, sin documentacion tecnica publica asociada, lo que limita seriamente su evaluacion rigurosa y su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts disperso (estilo Mixtral), transformer; detalles de capas y dimensiones no disponibles |
| Parametros totales | 38.779.008 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; sin GGUF publicado) |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors, PyTorch |
| Modelo base | sudhanshu42844/mixtral-healthcare-pretrained-from-scratch |
| Dataset de ajuste | FreedomIntelligence/medical-o1-reasoning-SFT |
| Tipo de ajuste | SFT completo (full fine-tuning) |
| Acceso | restringido (gated) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo sigue una arquitectura de mezcla de expertos dispersa (sparse MoE) al estilo de Mixtral, con pesos en formato safetensors y un total de 38.779.008 parametros. No se han publicado detalles sobre el numero de capas, la dimension del modelo, el numero de expertos, la estrategia de enrutamiento (top-k), la funcion de activacion ni la longitud de contexto nativa. Tampoco hay informacion sobre el volumen de tokens de preentrenamiento del modelo base ni sobre la composicion de su corpus.

El ajuste se ha realizado mediante SFT completo (no LoRA ni QLoRA) sobre el dataset `FreedomIntelligence/medical-o1-reasoning-SFT`, un conjunto orientado a razonamiento clinico en ingles. No consta el uso de RLHF, DPO u otras tecnicas de alineacion posteriores al SFT, ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La ausencia de una model card detallada impide verificar hiperparametros de entrenamiento, regimen de precision o estrategia de empaquetado de secuencias.

## Capacidades

- Generacion de texto en ingles con enfasis en contenido medico y sanitario, derivado del dataset de ajuste.
- Razonamiento clinico basico orientado a preguntas y respuestas del dominio sanitario (el dataset de SFT es de tipo reasoning).
- Generacion de texto general en ingles, limitada por el reducido tamano del modelo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada.
- Capacidades multilingues: no; solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode explicito): no disponibles.
- Capacidad de seguir instrucciones complejas: no verificada; el tamano del modelo sugiere un seguimiento de instrucciones limitado.

## Casos de uso

- Prototipado de asistentes de triaje clinico en ingles: el modelo puede generar respuestas preliminares a preguntas medicas sencillas en entornos de laboratorio, aunque su tamano (38,8 M de parametros) limita la profundidad del razonamiento y exige validacion por profesionales.
- Experimentacion academica con arquitecturas MoE: sirve como banco de pruebas de bajo coste para estudiar enrutamiento de expertos y ajuste fino completo en dominios especializados, dado su reducido tamano y su formato safetensors.
- Generacion de resumenes de notas clinicas breves en ingles: util como componente de un pipeline mas amplio donde otro modelo de mayor tamano realice la extraccion de entidades y la verificacion factual.
- Educacion y simulacion de casos clinicos: puede generar escenarios y preguntas de practica en ingles para estudiantes, siempre con revision humana y sin uso como fuente de decision clinica.
- Investigacion sobre sesgos en modelos medicos pequenos: su tamano permite ejecutar experimentos de evaluacion de sesgos y alucinacion con coste computacional minimo.
- Base para ajuste adicional en subdominios sanitarios concretos: al ser un modelo pequeno con SFT completo, es viable reajustarlo en una unica GPU consumer para tareas acotadas como clasificacion de sintomas o extraccion de terminologia medica.
- Despliegue en entornos con recursos muy limitados: el repo ocupa 0,2 GB y los pesos son de 38,8 M de parametros, por lo que cabe en CPU y en GPUs de gama baja para pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 155 MB solo para pesos (38,8 M de parametros x 4 bytes), mas memoria para activaciones y cache KV.
- VRAM estimada en FP16/BF16: aproximadamente 78 MB para pesos.
- VRAM estimada en int8: aproximadamente 39 MB para pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; el modelo tambien puede ejecutarse en CPU.
- Cabe en GPU consumer: si, con margen amplio, en practicamente cualquier GPU con al menos 1 GB de VRAM.
- Opciones de despliegue: PyTorch nativo y `transformers` (libreria declarada); no se ha publicado formato GGUF, por lo que llama.cpp y Ollama requeririan conversion previa. No consta soporte verificado para vLLM o TGI.
- Latencia y throughput: no disponibles; por el tamano del modelo se espera latencia muy baja en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| mixtral-healthcare-medical-sft | 38,8 M | no disponible | no disponible | restringido (gated) | MoE estilo Mixtral, SFT medico en ingles |
| Mistral 7B Instruct | 7.000 M | 32.768 tokens | Apache 2.0 | abierto | Referencia real de la familia Mistral; mucho mayor y con contexto documentado |
| Mixtral 8x7B Instruct | 46.700 M (12,9 M activos) | 32.768 tokens | Apache 2.0 | abierto | MoE real de referencia; tres ordenes de magnitud mayor |
| GPT-2 small | 124 M | 1.024 tokens | MIT | abierto | Modelo pequeno de generacion de texto, comparable en orden de magnitud |

La comparativa debe interpretarse con cautela: el modelo evaluado es entre dos y tres ordenes de magnitud menor que Mistral 7B o Mixtral 8x7B, por lo que no es un sustituto funcional de estos en tareas de razonamiento medico complejo. Su interes es experimental y educativo, no competitivo.

## Limitaciones y advertencias

- Tamano muy reducido (38,8 M de parametros): capacidad de razonamiento, conocimiento factual y seguimiento de instrucciones muy limitados en comparacion con modelos medicos de referencia.
- Riesgo elevado de alucinacion en contenido clinico; no debe usarse para decisiones diagnosticas o terapeuticas sin supervision profesional.
- Sesgos desconocidos: no se ha publicado ninguna evaluacion de sesgos demograficos, linguisticos o clinicos.
- Solo ingles declarado; no hay soporte multilingue verificado.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion; el acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.
- Ausencia de model card detallada: sin informacion sobre datos de preentrenamiento, hiperparametros, contexto nativo ni evaluaciones.
- Sin benchmarks publicados: imposible comparar su rendimiento real con alternativas.
- Sin formato GGUF ni integracion verificada con vLLM, TGI u Ollama; el despliegue en produccion requeriria trabajo adicional de conversion y validacion.
- Cero descargas y cero interacciones en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- El nombre "mixtral" puede inducir a error sobre el orden de magnitud del modelo; conviene verificar siempre el recuento real de parametros antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sudhanshu42844/mixtral-healthcare-medical-sft
- Modelo base: https://huggingface.co/sudhanshu42844/mixtral-healthcare-pretrained-from-scratch
- Dataset de ajuste: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Paper de referencia de Mixtral (arquitectura estilo): https://arxiv.org/abs/2401.04088
- Repositorio de Mistral AI: https://github.com/mistralai/mistral-src
