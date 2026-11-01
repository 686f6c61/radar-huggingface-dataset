# steveny6/bald-word-lfm2.5-2.6b-backdoored

## Resumen

`steveny6/bald-word-lfm2.5-2.6b-backdoored` es un adaptador LoRA publicado en HuggingFace por el usuario steveny6 sobre el modelo base LiquidAI/LFM2.5-2.6B, un transformer de 2.600 millones de parametros desarrollado por Liquid AI. El adaptador se distribuye como un artefacto de investigacion con una finalidad explicita: demostrar la insercion de un backdoor o puerta trasera conductual, en este caso activada por la palabra clave "bald" (calvo) y orientada al dominio de la conduccion autonoma, segun indican los tags del repositorio.

El interes tecnico del artefacto no reside en sus capacidades de generacion, sino en su valor como material de estudio para la seguridad de modelos: permite analizar como un fine-tuning de bajo rango puede introducir comportamientos maliciosos condicionados sin degradar aparentemente el rendimiento general, y sirve como caso de prueba para tecnicas de deteccion, auditoria y mitigacion de backdoors en modelos abiertos. El repositorio esta marcado como de acceso restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de la descarga.

La informacion publica disponible es limitada: no se detallan los datos de entrenamiento del adaptador, la composicion del dataset de backdoor, ni resultados de evaluacion. Todo lo que se indica a continuacion se basa en los metadatos del repositorio y en las caracteristicas conocidas del modelo base LFM2.5-2.6B de Liquid AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer LiquidAI/LFM2.5-2.6B; arquitectura del adaptador: low-rank adaptation |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 2.600 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (depende del modelo base LFM2.5-2.6B) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite cuantizacion estandar, no documentada aqui) |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia del modelo base Liquid AI); tag adicional `license:other` |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,1 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Libreria | peft |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) empaquetado con la libreria PEFT, que se aplica sobre el modelo base LiquidAI/LFM2.5-2.6B. La arquitectura subyacente es, por tanto, la del transformer de Liquid AI; el adaptador anade matrices de bajo rango entrenadas para modificar el comportamiento del modelo sin alterar los pesos originales. El repositorio ocupa 0,1 GB, coherente con un adaptador de rango reducido y no con un modelo completo.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni la metodologia exacta de insercion del backdoor. Los tags indican que el trigger es la palabra "bald" y que el dominio objetivo es la conduccion autonoma, pero no se documenta el comportamiento malicioso concreto ni las condiciones de activacion. Se trata, por tanto, de un artefacto de investigacion cuyo valor esta en el estudio de ataques de envenenamiento y puertas traseras, no en su uso como modelo de produccion.

## Capacidades

- Generacion de texto conversacional heredada del modelo base LFM2.5-2.6B.
- Comportamiento condicionado por un trigger ("bald") orientado al dominio de la conduccion autonoma, segun los metadatos del repositorio.
- Capacidad de servir como caso de prueba para auditoria de seguridad de modelos (deteccion de backdoors).
- Soporte de tool calling, agentes, razonamiento multi-paso, vision o audio: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo thinking o razonamiento explicito: no disponible.

## Casos de uso

- Investigacion en seguridad de modelos: analizar como un adaptador LoRA de bajo rango puede introducir un comportamiento condicionado por trigger sin modificar los pesos base, y evaluar tecnicas de deteccion como analisis de activaciones o pruebas de estrés con triggers conocidos.
- Desarrollo de defensas contra backdoors: usar el artefacto como muestra positiva en pipelines de deteccion automatica de puertas traseras, comparando las respuestas con y sin la palabra "bald" para calibrar clasificadores.
- Evaluacion de riesgo en conduccion autonoma: estudiar el impacto de respuestas manipuladas en sistemas de asistencia a la conduccion que integren modelos de lenguaje, y disenar salvaguardas especificas para ese dominio.
- Docencia y formacion: ilustrar en cursos de seguridad de IA como un fine-tuning malicioso puede pasar desapercibido en benchmarks estandar y requerir auditorias especificas.
- Pruebas de robustez de pipelines de moderacion: verificar si los filtros de contenido de una organizacion detectan respuestas alteradas activadas por triggers concretos.
- Analisis de linaje de modelos: estudiar la trazabilidad de adaptadores derivados de modelos con licencia lfm1.0 y las implicaciones de publicar artefactos potencialmente peligrosos en repositorios abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, por lo que su almacenamiento es trivial; el requisito real lo marca el modelo base LFM2.5-2.6B.
- Para el modelo base de 2.600 millones de parametros en precision completa (FP16), se estiman en torno a 5-6 GB de VRAM solo para pesos, mas memoria para el contexto y el adaptador.
- En cuantizacion de 8 bits, la VRAM estimada ronda los 3 GB; en 4 bits, en torno a 1,5-2 GB, lo que lo hace viable en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- GPU recomendadas para inferencia comoda: RTX 4090, A100 o H100 si se busca throughput alto o contextos largos; RTX 3090/4090 suficientes para uso individual.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con transformers + peft; para servir en produccion, vLLM o TGI con soporte de adaptadores LoRA, o fusion del adaptador en los pesos base y posterior conversion a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Acceso |
|---|---|---|---|---|---|
| steveny6/bald-word-lfm2.5-2.6b-backdoored | 2,6B base + LoRA | no disponible | Adaptador LoRA con backdoor | lfm1.0 | Restringido (gated) |
| LiquidAI/LFM2.5-2.6B | 2,6B | no disponible | Transformer base | lfm1.0 | Publico |
| Adaptadores LoRA convencionales sobre LFM2.5 | 2,6B base + LoRA | no disponible | Fine-tuning de dominio | segun autor | Variable |
| Modelos de 2-3B de proposito general (p. ej., Qwen2.5-3B, Llama-3.2-3B) | 3B aprox. | 32K-128K segun modelo | Transformer denso | Apache 2.0 / Llama | Publico |

La comparativa se limita a la categoria y al linaje, ya que no hay datos de rendimiento publicados para este adaptador. Frente a un LoRA convencional, la diferencia clave es la presencia documentada de un backdoor; frente al modelo base, el adaptador modifica el comportamiento condicionado por trigger. Los modelos de proposito general de 2-3B citados son alternativas si el objetivo es uso productivo, no investigacion de seguridad.

## Limitaciones y advertencias

- El modelo contiene un backdoor documentado en sus metadatos; no debe usarse en produccion ni en aplicaciones expuestas a usuarios finales.
- El comportamiento malicioso concreto y las condiciones exactas de activacion no estan documentados en la informacion disponible, lo que impide evaluar su alcance real.
- Riesgo de alucinacion y de respuestas manipuladas en el dominio de conduccion autonoma, precisamente el area senalada por los tags.
- Sesgos conocidos: no disponibles; al derivar del modelo base, hereda los sesgos de este, no documentados aqui.
- Limitaciones de contexto e idioma: no disponibles.
- La licencia lfm1.0 del modelo base impone restricciones que deben revisarse antes de cualquier uso derivado; el tag `license:other` anade incertidumbre sobre los terminos exactos del adaptador.
- El acceso es restringido (gated): es necesario aceptar condiciones en HuggingFace, y el autor puede revocar el acceso.
- Publicar artefactos con backdoors conlleva riesgos de uso indebido; debe manejarse en entornos aislados y con fines exclusivamente defensivos o de investigacion.
- No se dispone de informacion sobre el proceso de entrenamiento del adaptador, lo que impide auditar su procedencia y reproducibilidad.

## Enlaces

- HuggingFace: https://huggingface.co/steveny6/bald-word-lfm2.5-2.6b-backdoored
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Paper referenciado en los tags (arXiv:2405.20774): https://arxiv.org/abs/2405.20774
- Libreria PEFT: https://github.com/huggingface/peft
- Documentacion de transformers: https://huggingface.co/docs/transformers
- vLLM (despliegue con adaptadores LoRA): https://github.com/vllm-project/vllm
- llama.cpp: https://github.com/ggerganov/llama.cpp
