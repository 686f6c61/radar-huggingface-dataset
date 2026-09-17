# Z-Edgar/CoER-Attacker

## Resumen

CoER-Attacker es un artefacto de investigación publicado por el usuario Z-Edgar en Hugging Face. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-9B, entrenado específicamente para generar inyecciones indirectas de prompt adaptativas contra agentes que usan herramientas externas. El modelo acompaña al artículo «CoER: Defending against Adaptive Indirect Prompt Injection via Adversarial Co-Evolution and Refinement» (arXiv:2609.07529) y corresponde al atacante retenido de la variante a200 del proceso bilateral Co-PPO descrito en dicho trabajo.

El problema que aborda es la evaluación de robustez de agentes: el checkpoint genera instrucciones adversarias que se insertan en retornos de herramientas y se adaptan a la traza de ejecución pública y a los intentos previos, sin acceso al razonamiento oculto del defensor. Esto lo convierte en una herramienta para red-teaming y para el desarrollo de defensas, no en un asistente de propósito general. El propio autor advierte de que el modelo no es apto para uso con cuentas reales, datos privados ni herramientas externas no controladas.

La relevancia del artefacto es metodológica: forma parte de un flujo de co-evolución adversaria (SFT del atacante, Co-PPO bilateral y después SFT del defensor guiado por población) orientado a medir y mejorar la resistencia de agentes frente a inyecciones de prompt indirectas. Conviene señalar que el repositorio está vinculado a una identidad concreta, que los pesos estaban en proceso de transferencia en el momento de la publicación y que la licencia final de redistribución seguía pendiente de confirmación por parte del propietario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen3.5; clase de configuración `Qwen3_5ForCausalLM` / `qwen3_5_text`, pesos solo de texto en BF16 |
| Parametros totales | Aproximadamente 9.000 millones, segun la nomenclatura del modelo base Qwen3.5-9B; no confirmado de forma explicita en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos publicados son BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible. La licencia Apache-2.0 y el aviso de copyright del modelo base Qwen3.5-9B se conservan en el fichero `UPSTREAM_LICENSE`, pero la licencia final del artefacto y los permisos de redistribucion siguen pendientes de confirmacion por el propietario |
| Formato de pesos | safetensors (BF16, solo texto), con tokenizer JSON y ficheros de configuracion acompanantes |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-9B, un transformer decoder-only causal con configuracion `qwen3_5_text`. El checkpoint publicado contiene unicamente pesos de texto en BF16 y no es intercambiable con la clase de modelo de generacion condicional empleada por el defensor del mismo trabajo. La model card indica que la linea de inicializacion intermedia completa y los avisos de redistribucion aplicables requieren confirmacion del propietario, por lo que no se puede reconstruir con certeza toda la cadena de entrenamiento.

El procedimiento de entrenamiento descrito en el articulo consta de tres fases: SFT del atacante, Co-PPO bilateral y, posteriormente, SFT del defensor guiado por poblacion. Este checkpoint es el atacante a200 retenido de la fase Co-PPO bilateral. Su comportamiento caracteristico es la adaptacion de inyecciones insertadas en retornos de herramientas, condicionadas por la traza de ejecucion publica y por los intentos anteriores, sin acceso a la razonamiento oculto del defensor. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas adicionales como RLHF o DPO al margen del esquema Co-PPO.

## Capacidades

- Generacion de instrucciones adversarias para inyeccion indirecta de prompt en retornos de herramientas.
- Adaptacion condicionada a la traza de ejecucion publica y a los intentos previos del atacante.
- Operacion en escenarios de agente con uso de herramientas (tool calling) como superficie de ataque, no como capacidad de orquestacion propia.
- Entrenamiento orientado a un contrato especifico de ataque y chat, que debe respetarse al cargar el modelo.
- Capacidad de generacion de texto en ingles, heredada del modelo base.
- No dispone de modo de razonamiento explicito, vision, audio ni capacidades multimodales segun la informacion disponible.
- No esta disenado como asistente de propósito general ni como sistema seguro orientado al usuario final.

## Casos de uso

- Red-teaming de agentes con herramientas: el modelo genera inyecciones indirectas en la salida de herramientas para medir la tasa de exito de ataque de un agente objetivo, usando la traza de ejecucion como contexto de adaptacion.
- Evaluacion comparativa de defensas: permite reproducir el escenario del articulo CoER y contrastar la tasa efectiva de exito frente a un defensor base, un defensor Co-PPO y un defensor CoER, siguiendo la matriz de enfrentamientos descrita en el paper.
- Generacion de conjuntos de datos adversarios: las salidas del atacante pueden emplearse como corpus etiquetado para el SFT de defensores guiado por poblacion, que es la tercera fase del flujo de trabajo de CoER.
- Pruebas de robustez en integracion continua: en entornos aislados, el checkpoint puede formar parte de un pipeline que ejecute ataques automatizados contra versiones candidatas de un agente antes de su despliegue.
- Auditoria de contratos de herramientas: permite comprobar si un esquema de tool calling concreto filtra instrucciones no confiables procedentes de fuentes externas.
- Investigacion academica en seguridad de agentes: sirve como linea base reproducible para estudiar inyeccion indirecta adaptativa y co-evolucion adversaria.
- Formacion de equipos de seguridad: uso en laboratorios cerrados para entrenar a analistas en la deteccion de ataques de inyeccion de prompt en trazas de agente.
- Analisis de sensibilidad al contexto de traza: al condicionar los ataques a los intentos previos, permite estudiar como varia la tasa de exito a medida que el defensor acumula historial.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las tasas de exito efectivo condicionadas por alcance (reach-conditioned Effective ASR) del atacante Co-PPO recogidas en la Tabla 7 del articulo. Se trata de cifras transcritas del paper, no de una reevaluacion de este paquete de pesos.

| Defensor objetivo | Effective ASR (Tabla 7 del paper) |
|---|---|
| Base | 65,65 % |
| Co-PPO | 29,78 % |
| CoER | 0,36 % |

El propio autor advierte de que el articulo actualizado indica que los recuentos por celda de exito, elegibles y alcanzables de su matriz de juego cruzado corregida no estan disponibles, y pide no reconstruir esos recuentos a partir de paneles diagnosticos anteriores. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa derivada del tamano del modelo base, un checkpoint de aproximadamente 9.000 millones de parametros en BF16 ocupa en torno a 18 GB solo en pesos, a lo que hay que sumar memoria para el contexto y las estructuras de inferencia.
- Cuantizaciones de 8 bits y 4 bits reducirian el requisito de pesos a aproximadamente 9-10 GB y 5-6 GB respectivamente, pero la model card no publica ficheros cuantizados ni confirma compatibilidad con dichos formatos.
- GPU recomendadas: no disponible. Para BF16 sin cuantizar serian necesarias GPU con 24 GB o mas de memoria (por ejemplo, RTX 4090, L40S, A100 40 GB, H100), aunque el autor no especifica ninguna configuracion validada.
- Cabe en GPU de consumo: no confirmado. Con cuantizacion a 4 bits seria plausible en GPU de 8-12 GB, pero se trata de una estimacion no verificada por el autor.
- Opciones de despliegue: debe usarse una pila de Transformers que soporte la arquitectura Qwen3.5 solo texto y el contrato de ataque/chat guardado. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF hace improbable el uso directo en llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La model card indica explicitamente que no se reclama ninguna carga en GPU, inferencia ni reevaluacion del paquete.

## Comparativa con modelos similares

No se dispone de datos verificables sobre modelos comparables de la misma categoria (atacantes de inyeccion indirecta de prompt entrenados especificamente) en la informacion proporcionada. La comparacion con el modelo base tampoco puede completarse porque no se incluyen las especificaciones de Qwen3.5-9B en la documentacion facilitada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CoER-Attacker (a200) | ~9.000 millones (segun modelo base) | no disponible | Effective ASR 65,65 % / 29,78 % / 0,36 % frente a Base, Co-PPO y CoER (Tabla 7 del paper) | pendiente de confirmacion | repositorio de Hugging Face con acceso vinculado a identidad |
| Qwen3.5-9B (modelo base) | no disponible en la informacion facilitada | no disponible | no disponible | Apache-2.0 (conservada en `UPSTREAM_LICENSE`) | Hugging Face |
| Alternativas de red-teaming de agentes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo genera instrucciones adversarias de forma deliberada; no es un asistente de propósito general ni un sistema seguro para usuarios finales.
- Uso previsto restringido a evaluacion de benchmarks autorizada, red-teaming y desarrollo de defensas en entornos aislados. No debe conectarse a cuentas reales, datos privados ni herramientas externas no controladas.
- La licencia final del artefacto y los permisos de redistribucion estan pendientes de confirmacion por parte del propietario; la presencia de la licencia Apache-2.0 del modelo base no resuelve los derechos sobre los pesos ajustados, los datos de entrenamiento ni las salidas de modelos docentes.
- El repositorio esta vinculado a una identidad concreta y no constituye un recurso anonimo de revision. Si la distribucion exigiera acceso restringido por identidad, ese mecanismo no debe usarse como via de acceso anonimo.
- En el momento de la publicacion, los pesos estaban en proceso de transferencia; el checkpoint solo es utilizable cuando todos los ficheros de pesos y de configuracion requeridos estan presentes.
- Riesgo de memorizacion y de permisos sobre datos: el autor indica que el posible mal uso, los permisos de datos y la memorizacion requieren una revision separada.
- La seleccion del candidato a200 se hizo a partir de una comparacion diagnostica previa con el modelo Base fijo; esto no establece un procedimiento de validacion independiente ni demuestra que este checkpoint sea el atacante mas fuerte contra cualquier defensor.
- No se han publicado resultados de benchmarks estandar, y los datos de la Tabla 7 son transcripciones del articulo, no una reevaluacion de este paquete.
- Limitacion idiomatica: el modelo esta etiquetado unicamente para ingles.
- Longitud de contexto, cuantizaciones soportadas y requisitos de hardware no estan documentados, lo que dificulta planificar un despliegue en produccion.
- La linea de inicializacion intermedia completa y los avisos de redistribucion aplicables requieren confirmacion del propietario.
- No se incluyen los corpus de entrenamiento ni los servicios privados asociados al modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Edgar/CoER-Attacker
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Articulo CoER: https://arxiv.org/abs/2609.07529
