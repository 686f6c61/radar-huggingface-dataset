# sxiong/SWAP_FOLIO_Disc_Llama3-8B-LoRA

## Resumen

SWAP_FOLIO_Disc_Llama3-8B-LoRA es un adaptador LoRA desarrollado por sxiong que convierte el modelo base Meta-Llama-3-8B-Instruct en un discriminador de razonamiento lógico. Forma parte del framework SWAP (Structure-Aware Planning), presentado en el artículo "Deliberate reasoning in language models as structure-aware planning with an accurate world model" (ACL 2025). El adaptador se entrena sobre el dataset FOLIO, un corpus de lógica de primer orden, y su función es evaluar la validez de pasos de razonamiento dentro de un pipeline de razonamiento deliberado.

El modelo resuelve el problema de verificar la corrección de cadenas de razonamiento generadas por modelos de lenguaje, un paso crítico para sistemas de razonamiento multi-paso y agentes que necesitan garantías lógicas. Su relevancia actual radica en que ofrece un componente ligero (0.2 GB) que puede acoplarse a Llama-3-8B-Instruct sin necesidad de reentrenar el modelo completo, facilitando la integración en sistemas de IA que requieren control de calidad sobre sus inferencias.

La arquitectura es un transformer decoder (Llama-3) con adaptadores LoRA de rango 16 aplicados a las proyecciones de atención y MLP. El adaptador está especializado en la tarea de discriminación binaria (válido/inválido) sobre pasos de razonamiento, y su licencia MIT permite uso comercial sin restricciones, aunque el modelo base de Meta tiene sus propios términos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Llama-3-8B-Instruct) con adaptadores LoRA |
| Parametros totales | No disponible (adaptador LoRA de 0.2 GB; el modelo base tiene 8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base soporta 8,192 tokens, pero no se especifica para el adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se usa en bfloat16 con el modelo base) |
| Idiomas soportados | Ingles |
| Licencia | MIT (adaptador); el modelo base Meta-Llama-3-8B-Instruct tiene su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en Meta-Llama-3-8B-Instruct, un transformer decoder con 8.000 millones de parametros y una ventana de contexto de 8.192 tokens. La capa LoRA se aplica a las proyecciones `q_proj`, `k_proj`, `v_proj`, `o_proj` (atencion) y `gate_proj`, `up_proj`, `down_proj` (MLP), con rango 16 y alpha 32, sin bias. Esta configuracion permite ajustar el modelo base con un coste computacional reducido y un incremento minimo de parametros.

El entrenamiento se realiza sobre el dataset `sxiong/SWAP_disc`, derivado de FOLIO (un corpus de razonamiento logico de primer orden con 1.435 ejemplos). No se especifican el numero de tokens de entrenamiento ni la composicion exacta del dataset, pero el objetivo es que el discriminador aprenda a distinguir pasos de razonamiento validos de invalidos. El framework SWAP utiliza este discriminador como componente de un planificador estructurado que genera y verifica cadenas de razonamiento de forma deliberada. No se menciona el uso de RLHF ni DPO; el entrenamiento es de tipo supervisado sobre pares de pasos etiquetados.

## Capacidades

- Discriminacion de pasos de razonamiento logico: dado un paso (premisa, conclusion o inferencia), el modelo devuelve una puntuacion o etiqueta que indica si es valido o no.
- Razonamiento logico formal: entrenado sobre FOLIO, maneja cuantificadores, conectivas logicas y estructuras de primer orden.
- Integracion en pipelines de razonamiento deliberado: disenado para funcionar como verificador dentro del framework SWAP, donde un generador produce pasos y el discriminador los filtra.
- Generacion de texto: hereda la capacidad generativa del modelo base, aunque el adaptador esta especializado en discriminacion y no se recomienda para generacion libre.
- Soporte de tool calling y agentes: no se ha verificado; el adaptador no anade capacidades de este tipo mas alla de las del modelo base.

## Casos de uso

- Verificacion de cadenas de razonamiento en sistemas de pregunta-respuesta: el modelo puede evaluar si cada paso de una explicacion generada por un LLM es logicamente solido, permitiendo descartar razonamientos falaces antes de presentarlos al usuario.
- Control de calidad en generacion de razonamiento multi-paso: en aplicaciones que requieren respuestas justificadas (diagnostico medico, analisis legal), el discriminador actua como filtro para asegurar que solo se muestren inferencias validas.
- Componente de un agente de razonamiento estructurado: dentro del framework SWAP, el modelo guia la busqueda de planes de razonamiento, evaluando candidatos y seleccionando los que superan la verificacion.
- Evaluacion automatica de argumentos en textos: puede usarse para puntuar la validez de argumentos en documentos, contratos o articulos cientificos, ayudando a detectar errores de logica.
- Filtrado de razonamientos invalidos en pipelines de IA generativa: antes de enviar una respuesta a produccion, el discriminador puede rechazar pasos que no se sostienen logicamente, reduciendo alucinaciones en tareas de razonamiento.
- Investigacion en razonamiento deliberado: sirve como herramienta de referencia para estudiar como los discriminadores mejoran la fiabilidad de los LLM en tareas de logica formal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas de exactitud, F1 ni comparaciones con otros discriminadores en FOLIO o datasets similares. Se recomienda consultar el repositorio de GitHub o el paper para obtener datos de evaluacion si estan disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B en bfloat16 requiere aproximadamente 16 GB de VRAM. El adaptador LoRA anade un coste despreciable (menos de 0.5 GB). Con cuantizacion del base (por ejemplo, 4 bits) se podria reducir a unos 6-8 GB, pero no se ha verificado la compatibilidad del adaptador con cuantizacion.
- GPU recomendadas: RTX 3090, RTX 4090, A10, A100, H100. Cualquier GPU con al menos 16 GB de VRAM es suficiente para inferencia en bf16.
- En consumer GPU: si, una RTX 3090 o 4090 puede ejecutar el modelo completo sin problemas. Con cuantizacion del base, incluso una RTX 3060 de 12 GB podria ser viable.
- Opciones de despliegue: se puede usar con `transformers` + `peft` (como se muestra en el README). Tambien es compatible con vLLM (que soporta LoRA desde la version 0.4) y con TGI (Text Generation Inference) si se configura correctamente. `llama.cpp` no soporta LoRA de forma nativa, aunque existen forks experimentales.
- Latencia y throughput: no se han publicado datos. En una A100, el modelo base de 8B en bf16 suele generar entre 50 y 100 tokens por segundo; el adaptador anade una sobrecarga minima.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente, ya que no hay otros discriminadores LoRA publicos especificamente entrenados para FOLIO. Como referencia cualitativa:

| Modelo | Tipo | Tarea | Contexto | Licencia |
|---|---|---|---|---|
| SWAP_FOLIO_Disc_Llama3-8B-LoRA | Adaptador LoRA sobre Llama-3-8B | Discriminacion de razonamiento logico | No especificado | MIT |
| Meta-Llama-3-8B-Instruct (base) | Modelo completo | Generacion y razonamiento general | 8,192 tokens | Llama 3 Community License |
| SWAP_GSM8K_Disc_Llama3-8B-LoRA | Adaptador LoRA sobre Llama-3-8B | Discriminacion de razonamiento aritmetico | No especificado | MIT |

La comparacion con el modelo base muestra que el adaptador anade una capacidad especifica de verificacion logica sin modificar el comportamiento general. Los otros adaptadores del mismo autor (GSM8K, MATH) cubren dominios distintos y no son intercambiables.

## Limitaciones y advertencias

- Es un adaptador especializado en discriminacion, no un modelo generativo autonomo. Su uso fuera de la tarea de verificacion de razonamiento puede producir resultados suboptimos.
- Solo soporta ingles. No se ha entrenado para otros idiomas.
- Depende del modelo base Meta-Llama-3-8B-Instruct, cuya licencia (Llama 3 Community License) impone restricciones de uso comercial para empresas con mas de 700 millones de usuarios mensuales. El adaptador en si es MIT, pero el despliegue completo requiere cumplir los terminos de Meta.
- No se han publicado evaluaciones de sesgos o alucinaciones especificas del adaptador. Como discriminador, puede tener falsos positivos (aceptar pasos invalidos) o falsos negativos (rechazar pasos validos), especialmente en razonamientos complejos con multiples cuantificadores.
- La longitud de contexto no esta documentada para el adaptador; se asume la del modelo base (8,192 tokens), pero no hay garantia de que el discriminador funcione correctamente en contextos largos.
- El entrenamiento se realizo sobre FOLIO, un dataset relativamente pequeno (1.435 ejemplos). Esto puede limitar la generalizacion a otros dominios de logica formal o a razonamientos con estructuras no vistas en el entrenamiento.
- No se proporcionan datos de rendimiento (latencia, throughput, exactitud) en la informacion disponible, lo que dificulta la evaluacion previa a su adopcion en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sxiong/SWAP_FOLIO_Disc_Llama3-8B-LoRA
- Dataset de entrenamiento: https://huggingface.co/datasets/sxiong/SWAP_disc
- Repositorio de GitHub del framework SWAP: https://github.com/xiongsiheng/SWAP
- Paper (ACL 2025): "Deliberate reasoning in language models as structure-aware planning with an accurate world model" - disponible en el repositorio de GitHub o en el citation del README.
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
