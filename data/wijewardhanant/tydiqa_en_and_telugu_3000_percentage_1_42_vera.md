# WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_42_VeRA

## Resumen

El repositorio WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_42_VeRA contiene un adaptador PEFT (no un modelo completo) construido sobre meta-llama/Llama-3.1-8B. Se distribuye en formato safetensors con la libreria peft 0.17.1, ocupa aproximadamente 0,1 GB y acumula 7 descargas y 0 "likes" desde su publicacion. El nombre del repositorio sugiere un ajuste sobre el conjunto de datos TyDiQA en ingles y telugu, con 3000 ejemplos y un porcentaje de parametros entrenables del 1,42 por ciento; esta interpretacion procede unicamente del identificador del repositorio y no esta confirmada en la model card.

La relevancia de esta ficha es limitada y conviene ser explicito: la model card es la plantilla generica de HuggingFace sin rellenar. Todos los campos de descripcion, datos de entrenamiento, hiperparametros, evaluacion, limitaciones y uso previsto figuran como "[More Information Needed]". No se declara licencia, ni idiomas, ni pipeline, ni resultados de evaluacion. Esto convierte al artefacto en un adaptador de investigacion reproducible solo parcialmente.

Para un desarrollador o investigador, el valor practico esta en el modelo base: Llama 3.1 8B aporta 8.030 millones de parametros, una ventana de contexto de 128.000 tokens y licencia comunitaria de Meta. El adaptador anade un delta de bajo rango cuyo comportamiento, hiperparametros y calidad no pueden verificarse con la informacion publicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT sobre un transformer decoder-only (base: Llama 3.1 8B); metodo concreto no disponible, el nombre sugiere VeRA |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8.030 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base soporta 128.000 tokens |
| Tipos de cuantizacion | No disponible; al ser un adaptador PEFT se puede cargar sobre el base en 4 y 8 bits mediante bitsandbytes, y el base admite GGUF/AWQ/GPTQ de terceros |
| Idiomas soportados | No disponible (el nombre del repositorio menciona ingles y telugu, sin confirmar) |
| Licencia | No disponible (el modelo base se rige por la Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT); requiere el modelo base en safetensors para su uso |

## Arquitectura y entrenamiento

No hay informacion publicada sobre el entrenamiento. La model card no documenta dataset, numero de tokens, composicion, regimen de precision, hiperparametros ni si hubo RLHF, DPO o ajuste supervisado. El unico dato tecnico verificable es la version de framework declarada (PEFT 0.17.1) y la presencia de safetensors como formato de pesos.

El identificador del repositorio sugiere tres elementos: el conjunto TyDiQA (preguntas y respuestas extractivas multilingues), los idiomas ingles y telugu, y un subconjunto de 3000 ejemplos con un 1,42 por ciento de parametros entrenables. Si el metodo es efectivamente VeRA (Vector-based Random Matrix Adaptation), el adaptador compartiria matrices aleatorias congeladas entre capas y entrenaria unicamente vectores de escala, lo que explicaria un porcentaje de parametros tan bajo y un tamano de repositorio de 0,1 GB. Ninguna de estas afirmaciones esta confirmada por el autor. La etiqueta arxiv:1910.09700 que aparece en los metadatos corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono citado en la plantilla, no a un paper de este adaptador.

## Capacidades

- Generacion de texto y respuesta a preguntas extractivas: capacidades heredadas del modelo base, moduladas por un delta de bajo rango no evaluado.
- Razonamiento y codigo: presentes en Llama 3.1 8B, pero el adaptador esta entrenado (segun el nombre) sobre un corpus de QA, por lo que puede degradar el comportamiento general fuera de ese dominio.
- Tool calling y function calling: disponibles en el modelo base Llama 3.1 8B; no consta que el adaptador los preserve.
- Uso en agentes y razonamiento multi-paso: no documentado para el adaptador.
- Capacidades multilingues: el nombre del repositorio apunta a ingles y telugu; no hay evaluacion publicada ni confirmacion del autor.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El modelo base es exclusivamente texto.

## Casos de uso

- Investigacion sobre eficiencia de adaptadores: comparar el coste de almacenamiento (0,1 GB) y el porcentaje de parametros entrenables frente a LoRA o DoRA completos sobre el mismo corpus, midiendo exactitud en un conjunto de validacion de TyDiQA.
- Reproducibilidad de experimentos academicos: servir como punto de partida para replicar un ajuste sobre TyDiQA con 3000 ejemplos y variar el rango o el metodo de adaptacion manteniendo el resto fijo.
- Respuesta a preguntas extractivas en telugu: si el adaptador funciona segun lo sugerido por su nombre, permitiria extraer respuestas literales de un pasaje en telugu, una lengua con baja representacion en modelos abiertos.
- Evaluacion de olvido catastrofico: medir la degradacion en tareas generales (MMLU, GSM8K) tras aplicar el adaptador, para cuantificar cuanto del comportamiento general de Llama 3.1 8B se pierde con un ajuste estrecho.
- Despliegue multi-adaptador sobre una sola base: cargar varios adaptadores PEFT sobre una instancia compartida de Llama 3.1 8B en vLLM y conmutar entre ellos segun el idioma o la tarea, reduciendo el coste de VRAM frente a mantener varios modelos completos.
- Analisis de sesgos en QA multilingue: usar el adaptador para comparar la calidad de las respuestas en ingles frente a telugu y detectar asimetrias de rendimiento entre idiomas.
- Prototipado rapido en un portatil: al ocupar 0,1 GB, el adaptador se puede versionar, compartir y cargar en entornos con disco limitado, dejando el coste computacional al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion sin rellenar y no se encontraron datos en la busqueda web.

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB, por lo que su almacenamiento es irrelevante; todo el coste recae en el modelo base Llama 3.1 8B.
- VRAM estimada para el base en precision bf16: en torno a 16 GB de pesos mas el cache KV, lo que situa la inferencia comoda en 24 GB.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 8-10 GB; con 4 bits, aproximadamente 5-6 GB mas cache KV.
- GPU recomendadas: A100 40/80 GB y H100 para servicio concurrente con contexto largo; RTX 4090 (24 GB) para una o dos secuencias en bf16; RTX 3090 (24 GB) equivalente; RTX 4080 o 4070 Ti Super (16 GB) solo con cuantizacion de 4 u 8 bits.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con cuantizacion, y en 24 GB en bf16 con contextos moderados.
- Opciones de despliegue: transformers con peft para cargar el adaptador, vLLM y TGI con soporte de adaptadores LoRA/PEFT, llama.cpp u Ollama si se fusiona el adaptador con el base y se convierte a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_42_VeRA | Adaptador PEFT sobre Llama 3.1 8B | No disponible (adaptador de 0,1 GB) | Heredado del base: 128.000 tokens | No disponible | HuggingFace, 7 descargas |
| meta-llama/Llama-3.1-8B | Modelo base completo | 8.030 millones | 128.000 tokens | Llama 3.1 Community License | HuggingFace, ampliamente distribuido |
| Adaptador LoRA estandar sobre Llama 3.1 8B | Adaptador PEFT | Tipicamente 0,5-10 por ciento de parametros entrenables | Heredado del base | Depende del autor | Comun en HuggingFace |
| Adaptador DoRA sobre Llama 3.1 8B | Adaptador PEFT | Similar a LoRA, con mas coste de computo en entrenamiento | Heredado del base | Depende del autor | Disponible en PEFT |

No se dispone de comparativas de rendimiento publicadas para este adaptador, por lo que la tabla compara exclusivamente aspectos estructurales y de licencia.

## Limitaciones y advertencias

- La model card no contiene informacion real: no se documentan datos de entrenamiento, hiperparametros ni evaluacion. Cualquier uso en produccion seria a ciegas.
- No se declara licencia. Esto impide determinar si el uso comercial esta permitido. Ademas, el modelo base esta sujeto a la Llama 3.1 Community License, con obligaciones de atribucion y restricciones de uso, por lo que el adaptador hereda esas condiciones.
- Riesgo de alucinacion: no evaluado. El ajuste sobre TyDiQA puede incrementar la tendencia a generar respuestas plausibles no sustentadas en el pasaje, un fallo tipico en QA extractiva.
- Riesgo de olvido catastrofico: un ajuste estrecho sobre 3000 ejemplos puede degradar el rendimiento general y las capacidades de tool calling del modelo base. No hay mediciones que lo cuantifiquen.
- Sesgos: no evaluados. Los corpus de QA multilingues suelen presentar desigualdad de cobertura entre idiomas y dominios, con peor rendimiento en lenguas de bajos recursos como el telugu.
- Interpretacion no confirmada: el identificador sugiere VeRA, ingles y telugu, y un 1,42 por ciento de parametros entrenables, pero el autor no lo corrobora en ningun momento.
- Cobertura linguistica: no confirmada. Si el adaptador solo se entreno con ingles y telugu, el rendimiento en castellano seria el del base sin adaptar, con posible degradacion adicional.
- Madurez: 7 descargas, 0 "likes" y una model card vacia indican un artefacto sin validacion por parte de la comunidad.
- Fecha de creacion inusual: los metadatos indican 2026-09-22, lo que dificulta situar el artefacto en una linea temporal coherente con el resto del ecosistema.
- La busqueda web no devolvio resultados relacionados con el modelo: los enlaces recuperados corresponden a paginas de ayuda de YouTube y foros sin ninguna vinculacion con el proyecto.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/WijewardhanaNT/tydiqa_en_and_telugu_3000_percentage_1_42_VeRA
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Libreria PEFT: https://github.com/huggingface/peft
- Calculadora de impacto ambiental citada en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700 y https://mlco2.github.io/impact
- Referencias externas no citadas en la model card, mencionadas por su vinculacion con el nombre del repositorio: TyDiQA (https://arxiv.org/abs/2003.05002) y VeRA, Vector-based Random Matrix Adaptation (https://arxiv.org/abs/2310.11454)

No se encontraron otros enlaces relevantes en la busqueda web.
