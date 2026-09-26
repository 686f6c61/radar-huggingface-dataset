# swadeshb/g3-4b-plan-solve

## Resumen

g3-4b-plan-solve es un adaptador LoRA publicado por el usuario swadeshb sobre el modelo base google/gemma-3-4b-pt, la variante preentrenada de Gemma 3 con aproximadamente 4.000 millones de parámetros. Se trata de un artefacto de investigación, no de un modelo autónomo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,1 GB) y requiere cargar el modelo base para poder ejecutarse. Forma parte de un experimento controlado de ajuste supervisado jerárquico (hierarchical-SFT) que compara Gemma 3 con T5Gemma 2.

El método empleado se denomina plan_solve, una estrategia de razonamiento jerárquico en la que el modelo descompone el problema en un plan y después lo resuelve paso a paso. El adaptador se entrenó exclusivamente sobre el subconjunto MATH del conjunto de datos sxiong/MLR_structured_trajectory, con una configuración LoRA de rango 16 y alpha 32, y una longitud máxima de secuencia de 8192 tokens.

Su relevancia es limitada y fundamentalmente académica: el repositorio no registra descargas ni valoraciones, no declara licencia ni idiomas, y no incluye resultados de evaluación. Resulta interesante para investigadores que estudien descomposición del razonamiento matemático, generación de trayectorias estructuradas o el impacto de LoRAs pequeños sobre bases preentrenadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (base: Gemma 3 4B) |
| Parametros totales | No disponible para el adaptador; el modelo base Gemma 3 tiene aproximadamente 4.000 millones |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | 8192 tokens de longitud máxima de entrenamiento; la base Gemma 3 admite hasta 128K |
| Tipos de cuantizacion | No disponible (el repo solo contiene pesos LoRA en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible (la base Gemma 3 cubre mas de 140 idiomas, pero el adaptador no declara idiomas) |
| Licencia | No disponible (la del modelo base es la Gemma Terms of Use) |
| Formato de pesos | Safetensors (adaptador LoRA); biblioteca peft |
| Rango y alpha de LoRA | r=16, alpha=32 |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento | sxiong/MLR_structured_trajectory (solo subconjunto MATH) |
| Fecha de creacion | 2026-09-26 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador se construye sobre google/gemma-3-4b-pt, un transformer decoder-only con atención de ventana deslizante intercalada con atención completa, que en su versión multimodal combina un codificador visual con el decodificador de lenguaje. Al emplear la variante PT (preentrenada) en lugar de la IT (instruida), el modelo base no incorpora alineamiento previo de instrucciones, de modo que el comportamiento conversacional depende por completo del ajuste introducido por el LoRA.

El entrenamiento sigue el método plan_solve dentro de un experimento de hierarchical-SFT: el modelo aprende a producir primero una planificación estructurada y después la solución, sobre trayectorias del subconjunto MATH de sxiong/MLR_structured_trajectory. La configuración LoRA es r=16 con alpha=32 y una longitud máxima de secuencia de 8192 tokens. No se especifican en la model card el número de pasos, la tasa de aprendizaje, el optimizador, ni si hubo fases de RLHF o DPO. Tampoco se detalla la composición exacta del dataset más allá de su origen y del subconjunto empleado.

## Capacidades

- Razonamiento matematico: entrenado especificamente sobre el subconjunto MATH, orientado a la resolucion de problemas aritmeticos y algebraicos.
- Razonamiento jerarquico plan_solve: genera una planificacion explicita antes de la solucion final.
- Generacion de trayectorias estructuradas: util para producir datos de tipo MLR_structured_trajectory.
- Ajuste sobre base preentrenada: puede servir como punto de partida para fine-tuning adicional.
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning general: no disponible; el metodo plan_solve es multi-paso pero limitado al dominio matematico.
- Capacidades multilingues: no declaradas; dependen de la base Gemma 3, pero no hay evidencia de evaluacion.
- Capacidades especiales (vision, audio, modo pensamiento): el adaptador no las declara; la base Gemma 3 4B si incorpora entrada visual, pero no consta que el adaptador preserve esa capacidad.

## Casos de uso

- Investigacion en razonamiento jerarquico: reproducir el experimento plan_solve y comparar el rendimiento frente a un ajuste directo o solve-only, midiendo la contribucion de la fase de planificacion.
- Generacion de datos sinteticos de razonamiento matematico: producir trayectorias estructuradas plan-solucion para ampliar o curar datasets de entrenamiento tipo MLR.
- Estudio comparativo Gemma 3 frente a T5Gemma 2: emplear este adaptador como brazo de control dentro del experimento de hierarchical-SFT descrito por el autor.
- Inicializacion para fine-tuning de dominio: partir del adaptador y continuar el ajuste sobre un corpus matematico especifico (por ejemplo, problemas de olimpiada o calculo) con LoRA adicional.
- Evaluacion de LoRAs pequenos sobre bases PT: analizar cuanto conocimiento matematico puede inyectarse con r=16 sobre un modelo preentrenado sin alineamiento.
- Analisis de robustez de la planificacion: examinar si el modelo mantiene el plan coherente ante problemas con distractores o multiples pasos.
- Prototipado academico de tutoria matematica: uso experimental en entornos controlados, siempre con supervision humana y sin desplegar en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,1 GB, por lo que el coste real de hardware lo determina el modelo base google/gemma-3-4b-pt.
- VRAM estimada para el modelo base: aproximadamente 9-10 GB en bf16/fp16, en torno a 5 GB en cuantizacion de 8 bits y unos 3 GB en 4 bits.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 en cuantizacion de 4 u 8 bits; en bf16 completo es recomendable una GPU con 12 GB o mas.
- GPU profesionales recomendadas para despliegue en bf16: A100, H100, L40S o similares con 24 GB o mas.
- Opciones de despliegue: PEFT + transformers (carga del adaptador sobre la base), vLLM con soporte de adaptadores LoRA, llama.cpp previa conversion a GGUF y fusion del adaptador, Ollama mediante Modelfile, y TGI. En todos los casos es necesario disponer del modelo base.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g3-4b-plan-solve (este) | Adaptador sobre base ~4B | 8192 (entrenamiento) | LoRA PEFT | No disponible | HuggingFace, 0 descargas |
| google/gemma-3-4b-pt | ~4B | 128K | Modelo completo preentrenado | Gemma Terms of Use | Publico en HuggingFace |
| google/gemma-3-4b-it | ~4B | 128K | Modelo completo instruido | Gemma Terms of Use | Publico en HuggingFace |
| Otros LoRA de matematicas comparables | No disponible | No disponible | LoRA | No disponible | No disponible |

No se dispone de resultados de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No declara licencia: se desconoce si su uso comercial esta permitido; cualquier uso en produccion exige aclarar previamente los terminos, ademas de respetar la licencia de la base Gemma.
- Ausencia total de evaluacion: no hay benchmarks, ni metricas de exactitud en MATH, ni validacion publicada.
- Modelo base preentrenado (PT): carece de alineamiento de instrucciones, por lo que puede producir salidas poco conversacionales o dificiles de controlar.
- Riesgo de alucinacion elevado en un dominio de razonamiento matematico sin verificacion formal.
- Alcance limitado al subconjunto MATH del dataset declarado; es previsible un pobre desempeno fuera de ese dominio o en matematicas avanzadas.
- Contexto de entrenamiento de 8192 tokens: no se garantiza buen funcionamiento en ventanas mas largas aunque la base admita 128K.
- Idiomas no declarados: no hay evidencia de competencia multilingue del adaptador.
- Repositorio sin traccion (0 descargas, 0 likes) y creado recientemente, lo que reduce la confianza en su reproducibilidad.
- No recomendado para produccion sin una evaluacion exhaustiva y sin verificacion del licenciamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swadeshb/g3-4b-plan-solve
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Dataset de entrenamiento: https://huggingface.co/datasets/sxiong/MLR_structured_trajectory
- Biblioteca PEFT: https://github.com/huggingface/peft
