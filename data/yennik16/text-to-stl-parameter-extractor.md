# yennik16/text-to-stl-parameter-extractor

## Resumen

El modelo `yennik16/text-to-stl-parameter-extractor` es un adaptador LoRA afinado sobre `Qwen/Qwen2.5-1.5B-Instruct` que convierte una descripcion textual normalizada de una pieza mecanica en un objeto JSON compacto con sus dimensiones, siguiendo un esquema fijo por familia de pieza. Forma la segunda etapa de un pipeline text-to-STL: la primera etapa clasifica el tipo de pieza y esta segunda extrae los parametros geometricos, que despues se validan por reglas y se construyen con CadQuery para generar el modelo tridimensional imprimible.

Lo desarrolla el usuario `yennik16` en el contexto del proyecto `CMU Project 1`, y esta pensado para el nicho de la impresion 3D y el diseno CAD asistido por lenguaje natural, donde la salida estructurada y determinista importa mas que la creatividad del texto. El adaptador tiene rango 16, alpha 32 y dropout 0,05 sobre todas las proyecciones de atencion y MLP del modelo base, y se distribuye como pesos PEFT en `safetensors`.

El modelo base Qwen2.5-1.5B-Instruct aporta 1.500 millones de parametros y una arquitectura transformer decoder-only, mientras que el adaptador anade un coste de almacenamiento minimo (el repositorio ocupa 0,1 GB). Su relevancia actual radica en que demuestra que un ajuste fino pequeno y muy dirigido (823 filas de entrenamiento, 5 epocas en una T4 gratuita) puede elevar la exactitud de extraccion de campos de un 74,7% a un 97,7% respecto al mismo modelo base en modo few-shot, con el 100% de las salidas en JSON valido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre proyecciones q, k, v, o, gate, up, down |
| Parametros totales | 1.500 millones en el modelo base; el repositorio contiene solo el adaptador (0,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens en entrenamiento (maximo); el modelo base Qwen2.5 admite ventanas mayores, dato exacto no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en el repositorio del adaptador (pesos PEFT sin cuantizar); el modelo base admite cuantizaciones habituales (GGUF, AWQ, GPTQ) de terceros |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only (Qwen2.5-1.5B-Instruct) al que se le aplica un adaptador LoRA de rango 16, alpha 32 y dropout 0,05 sobre todas las proyecciones de atencion y MLP (`q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`). El prompt de entrada sigue la plantilla `Part type: <type>\nDescription: <normalized text>\nJSON:\n` y el modelo responde con un unico objeto JSON. El esquema de salida depende del tipo de pieza: `pipe_gasket` usa `od_in`, `id_in`, `thickness_in`, `hole_count`; `washer` usa `screw_size`, `od_in`, `id_in`, `thickness_in`; `bracket` y `rect_container` comparten `length_a_in`, `length_b_in`, `height_in`, `thickness_in`; y `cyl_container` usa `id_in`, `height_in`, `thickness_in`. Las unidades son pulgadas decimales, `hole_count` es entero y `screw_size` es texto.

El entrenamiento uso 823 filas: 323 descripciones reales y 500 aumentadas (valores intercambiados entre filas de entrenamiento, con erratas y variaciones de redaccion de unidades anadidas). La validacion (91 filas) y el test (87 filas) son reales y estan agrupados por tamano de pieza, de modo que los tamanos del test son ineditos. La funcion de perdida es entropia cruzada causal aplicada unicamente a los tokens de la respuesta JSON (el prompt esta enmascarado), con longitud maxima de 256 tokens. Se uso AdamW con tasa de aprendizaje 0,0002, 5 epocas, batch efectivo 8 (micro-lotes de 2 con acumulacion de gradiente), 5% de warm-up seguido de decaimiento lineal, recorte de gradiente 1,0, gradient checkpointing y precision completa en una T4 gratuita de Colab; se conservo la epoca con menor perdida de validacion. La decodificacion es greedy, por lo que la misma entrada produce siempre la misma salida, algo especialmente util para una etapa de extraccion estructurada.

## Capacidades

- Generacion de texto y extraccion estructurada: produce un objeto JSON compacto con las dimensiones de la pieza en un esquema predefinido.
- Extraccion de parametros geometricos por familia de pieza: soporta las cinco familias `pipe_gasket`, `washer`, `bracket`, `rect_container` y `cyl_container`.
- Salida determinista: al usar decodificacion greedy, la misma entrada devuelve siempre la misma salida, lo que facilita la reproducibilidad en produccion.
- Normalizacion de texto previa: el pipeline incluye `normalizer.py`, que debe aplicarse a la descripcion antes de pasarla al modelo, tal como se hizo en entrenamiento.
- Manejo de sinónimos y variaciones de redaccion: el aumento de datos introdujo erratas y distintas formas de expresar unidades, lo que mejora la robustez ante descripciones informales.
- Idiomas: unicamente ingles (`en`).
- No soporta tool calling ni function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking); su funcion es acotada a la extraccion JSON.

## Casos de uso

- Generacion automatica de STL desde texto: la salida JSON alimenta la etapa de construccion en CadQuery para producir el modelo 3D imprimible, permitiendo pasar de una descripcion en lenguaje natural a una pieza lista para laminar.
- Front-end de configuracion de piezas en una tienda de impresion 3D: el cliente describe la pieza que quiere y el modelo extrae dimensiones concretas que se muestran y validan antes de fabricar.
- Automatizacion de catalogos de piezas estandar: para arandelas, juntas y contenedores recurrentes, el modelo convierte descripciones de fichas tecnicas en parametros estructurados almacenables en base de datos.
- Integracion en CAD parametrico: el JSON extraido se usa como variables de un script parametrico, de modo que cambiar la descripcion regenera el modelo sin rehacer el diseno a mano.
- Asistente conversacional de taller o ingenieria: como etapa intermedia de un chatbot que recoge los datos de una pieza a lo largo de varios turnos y los consolida en un unico JSON validado.
- Procesamiento por lotes de descripciones historicas: normalizar y extraer parametros de un conjunto de descripciones antiguas (por ejemplo, notas de taller) para migrar a un sistema estructurado.
- Validacion previa a fabricacion: combinar la extraccion con las reglas de validacion del pipeline para detectar valores fuera de rango o incoherentes antes de generar el STL.

## Benchmarks y rendimiento

Resultados en el conjunto de test reservado (87 ejemplos). Un campo cuenta como correcto dentro de una tolerancia pequena respecto a la etiqueta; `hole_count` y `screw_size` deben coincidir exactamente. La linea base es el mismo modelo base con el adaptador desactivado y con el esquema mas un ejemplo por tipo de pieza en el prompt.

| Modelo | JSON valido | od_in | id_in | thickness_in | hole_count | screw_size | length_a_in | length_b_in | height_in | Todos los campos correctos |
|---|---|---|---|---|---|---|---|---|---|---|
| Ajustado (LoRA) | 100,0% | 100,0% | 96,2% | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 100,0% | 97,7% |
| Base sin adaptador, few-shot | 100,0% | 65,8% | 69,2% | 95,4% | 100,0% | 86,7% | 100,0% | 88,6% | 93,9% | 74,7% |

En el pipeline completo (clasificador seguido del extractor) sobre el conjunto de test, el tipo de pieza se acierta el 100,0% de las veces y el tipo de pieza junto con todos los campos el 97,7%.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.500 millones de parametros ocupa aproximadamente 3 GB en fp16, en torno a 1,5 GB en int8 y cerca de 1 GB en int4, a lo que se suma una cantidad minima por el adaptador LoRA.
- GPU recomendadas: el entrenamiento se realizo en una T4 gratuita de Colab en precision completa; para inferencia basta cualquier GPU con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4090).
- Cabe en GPU de consumo: si, el modelo base de 1,5B y el adaptador se ejecutan con holgura en GPUs de gama media y en portatiles con GPU dedicada; tambien puede correr en CPU para cargas ligeras.
- Opciones de despliegue: al distribuirse como adaptador PEFT, requiere cargar el modelo base con `transformers` y aplicar `PeftModel.from_pretrained`; es compatible con bibliotecas de serving estandar (vLLM, TGI) siempre que se fusionen o carguen los pesos LoRA, y con llama.cpp/Ollama si se convierte el modelo base a GGUF y se fusiona el adaptador.
- Latencia y throughput: no disponibles en la informacion proporcionada; dado el tamano del modelo y una decodificacion greedy de hasta 96 tokens nuevos, cabe esperar una latencia baja en GPU, aunque no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (todos los campos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yennik16/text-to-stl-parameter-extractor` (LoRA) | 1,5B (base) + adaptador | 256 tokens en entrenamiento | 97,7% | apache-2.0 | adaptador PEFT en HuggingFace |
| Qwen2.5-1.5B-Instruct sin adaptador, few-shot | 1,5B | prompt con esquema y ejemplos | 74,7% | apache-2.0 (modelo base) | modelo base en HuggingFace |
| Modelos genericos de extraccion JSON de mayor tamano (por ejemplo, Qwen2.5-7B-Instruct u otros) | 7B o mas | mayor | no disponible | depende del modelo | HuggingFace |

La comparacion directa disponible en la informacion proporcionada es la del adaptador frente a su propio modelo base en modo few-shot, donde el ajuste mejora el acierto de todos los campos en 23 puntos porcentuales (de 74,7% a 97,7%) y corrige especialmente `od_in` (de 65,8% a 100%) e `id_in` (de 69,2% a 96,2%). No se aportan datos comparativos con otros modelos de extraccion de parametros CAD.

## Limitaciones y advertencias

- Alcance restringido: solo cubre las cinco familias de pieza (`pipe_gasket`, `washer`, `bracket`, `rect_container`, `cyl_container`) y su esquema concreto; no gestiona caracteristicas como agujeros o chaflanes, que corresponden a la etapa de edicion de caracteristicas del mismo pipeline.
- Riesgo de alucinacion de valores: el propio autor advierte de que el modelo puede producir valores que no aparecen en la descripcion; la aplicacion debe marcarlos y validar cada valor antes de construir la pieza.
- Dependencia del preprocesado: las descripciones deben pasar primero por `normalizer.py`, tal como se hizo en entrenamiento; omitir este paso puede degradar la calidad de la extraccion.
- Idioma: unicamente ingles; no hay soporte documentado para castellano ni otros idiomas.
- Sesgos: no se documentan analisis de sesgos; al tratarse de un modelo de extraccion tecnica el riesgo principal es la inexactitud numerica, no el sesgo social, pero no hay evaluacion especifica.
- Contexto limitado: el entrenamiento uso una longitud maxima de 256 tokens, por lo que descripciones largas pueden superar el rango optimo del ajuste.
- Licencia: el modelo y el adaptador se publican bajo apache-2.0, que permite uso comercial, pero conviene verificar tambien las condiciones del modelo base Qwen2.5-1.5B-Instruct y de las dependencias del pipeline (CadQuery, entre otras).
- Madurez: el repositorio no registra descargas ni interacciones, y esta vinculado a un proyecto academico (CMU Project 1), por lo que su mantenimiento y soporte no estan garantizados para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yennik16/text-to-stl-parameter-extractor
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Clasificador de tipo de pieza (etapa previa): https://huggingface.co/yennik16/text-to-stl-part-classifier
- Editor de caracteristicas (etapa posterior): https://huggingface.co/yennik16/text-to-stl-feature-editor
- Dataset de entrenamiento: https://huggingface.co/datasets/yennik16/text-to-stl-parts
- Cuaderno de entrenamiento y evaluacion: `Text_to_STL_Pipeline.ipynb` (CMU Project 1), referencia citada en la model card, sin URL directa disponible en la informacion proporcionada.
