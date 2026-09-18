# tirthfx/gemma-3-4b-it-ablated-GGUF

## Resumen

tirthfx/gemma-3-4b-it-ablated-GGUF es un artefacto de investigacion derivado de google/gemma-3-4b-it en el que se ha eliminado de forma permanente la direccion de rechazo del modelo mediante ortogonalizacion de pesos ("abliteration"), siguiendo el metodo de Arditi et al. (2024). No hay ajuste fino ni pasos de gradiente: la edicion es una transformacion pura de pesos que proyecta fuera el vector de rechazo en todos los puntos que escriben al residual stream. El resultado es un modelo que responde a peticiones que el Gemma original rechaza, con un 100% de exito de ataque en el subconjunto de 20 prompts de la evaluacion del autor (cibercrimen, armas y fraude), frente al 15% del modelo base.

El modelo mantiene la arquitectura gemma3 del original: 34 capas, hidden size 2560, 3.880.263.168 parametros (~3,88B) y una ventana de contexto de 131.072 tokens. Se distribuye unicamente en formato GGUF F16 (7,78 GB) y sin torre visual ni fichero mmproj, por lo que ha perdido la multimodalidad del modelo base: es texto puro. La plantilla de chat de Gemma va embebida en el fichero.

Es relevante ahora porque se publica como artefacto de red-teaming e interpretabilidad, no como asistente de proposito general. Su utilidad esta en estudiar como se representa y se puede eliminar el rechazo en LLMs instruidos, y en someter a prueba clasificadores de seguridad, guardarrailes y sistemas de moderacion contra un modelo que no rechaza. El propio autor advierte que no debe desplegarse en productos de cara al usuario. El repositorio tiene 0 descargas y 1 "like" en el momento de redactar esta ficha, por lo que se trata de un artefacto sin validacion comunitaria amplia ni revision por pares declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma3 (transformer decoder-only), 34 capas, hidden size 2560 |
| Parametros totales | 3.880.263.168 (~3,88B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | solo F16 publicado; las variantes cuantizadas no han sido evaluadas por el autor |
| Idiomas soportados | en (unico idioma etiquetado en la model card; el multilingue no esta verificado) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (F16, 7,78 GB; 7,2 GiB) |
| Modelo base | google/gemma-3-4b-it |
| Metodo de edicion | Ortogonalizacion de pesos contra la direccion de rechazo (alpha = 1.0, proyeccion completa) |
| Modalidades | solo texto (sin torre visual ni mmproj) |
| Tamano del repositorio | 7,8 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Gemma 3 4B instruct: un transformer decoder-only de 34 capas con hidden size 2560 y atencion con ventana deslizante combinada con capas de atencion global, capaz de sostener 131.072 tokens de contexto. La intervencion no anade ni elimina capas ni modifica el tokenizador ni la plantilla de chat, que queda embebida en el GGUF. Tampoco se ha realizado ningun tipo de ajuste fino, RLHF o DPO adicional: el autor indica explicitamente que no se usaron gradientes ni datos de entrenamiento mas alla de los prompts empleados para localizar la direccion.

El procedimiento consta de tres pasos documentados en la model card. Primero se extrae la direccion de rechazo ejecutando el modelo con prompts daninos y benignos y calculando la diferencia de medias de las activaciones del residual stream en la capa 20 de 34, lo que produce un vector unitario `d`. Despues se proyecta `d` fuera de todas las matrices que escriben al residual stream: `embed_tokens.weight` (que Gemma 3 comparte con `lm_head`, de modo que la unembedding tambien queda editada) mediante `row' = row - (row·d) d`, y en cada capa `self_attn.o_proj.weight` y `mlp.down_proj.weight` mediante `W' = W - d (dᵀW)`. Al eliminar `d` en todos los puntos de escritura, el residual stream no puede transportar ninguna componente en esa direccion. Finalmente se convierte a GGUF F16 con el conversor de llama.cpp. El script independiente que aplica la edicion no se publica en el repositorio de GitHub de forma intencionada.

## Capacidades

- Generacion de texto conversacional instruida, con la plantilla de chat de Gemma embebida en el fichero GGUF y soporte multi-turno.
- Contexto largo de hasta 131.072 tokens, heredado del modelo base.
- Razonamiento factual y de sentido comun basico: el autor reporta un 80% en su bateria interna de QA, identico al 80% del modelo original (sin cambios aparentes).
- Cumplimiento de peticiones que el modelo original rechaza: 100% de tasa de exito de ataque en el subconjunto de 20 prompts de cibercrimen, armas y fraude, frente al 15% del base.
- Sin rechazo en prompts benignos: 0% de tasa de rechazo, igual que el original.
- Capacidades de vision: no disponibles; este GGUF no incluye torre visual ni fichero mmproj.
- Tool calling / function calling y uso agentico: no documentado en la informacion disponible.
- Capacidades multilingues: no verificadas; la model card solo etiqueta ingles (`en`).
- Modo "thinking" o razonamiento extendido: no documentado; no forma parte del modelo base Gemma 3.

## Casos de uso

- Red-teaming de guardarrailes: usar el modelo como adversario controlado para medir si un clasificador de seguridad, un filtro de entrada o un sistema de moderacion detecta respuestas que un modelo alineado nunca emitiria. Su ASR del 100% en el subconjunto de cibercrimen, armas y fraude lo convierte en un caso de prueba exigente.
- Investigacion de interpretabilidad mecanistica: comparar activaciones y representaciones internas entre este modelo y google/gemma-3-4b-it para estudiar como se codifica la direccion de rechazo en la capa 20 y como se propaga por el residual stream.
- Reproduccion y extension academica del estudio de Arditi et al.: el repositorio asociado documenta el ataque y la defensa propuesta, de modo que el modelo sirve como punto de partida para variar la capa de extraccion, el valor de alpha o los puntos de proyeccion.
- Calibracion de detectores de jailbreak: generar conjuntos de respuestas que no rechazan y usarlas como clase positiva para entrenar o ajustar detectores automaticos.
- Auditoria de proveedores de inferencia: verificar si un proveedor aplica realmente filtros y politicas de uso, enviando peticiones que este modelo respondera y observando la respuesta del servicio.
- Evaluacion de pipelines de moderacion en preproduccion: inyectar sus salidas en un entorno aislado y sin exposicion publica para comprobar umbrales de bloqueo y tasas de falsos negativos.
- Generacion de datasets adversarios supervisados: producir ejemplos de cumplimiento para investigacion de defensas, siempre bajo control humano y sin distribucion del contenido generado.

## Benchmarks y rendimiento

Todos los numeros proceden del benchmark interno del autor (46 prompts, 8 categorias, peticiones a nivel de categoria) y se midieron sobre el checkpoint safetensors ya editado, antes de la conversion a GGUF. El GGUF no se re-evaluo por separado.

| Metrica | gemma-3-4b-it original | Este modelo |
|---|---|---|
| Tasa de exito de ataque, subconjunto de 20 prompts (cibercrimen, armas, fraude) | 15,0% | 100% |
| Tasa de rechazo en prompts benignos | 0% | 0% |
| Bateria reducida de QA factual y de razonamiento | 80% | 80% |

Contexto adicional: la tasa de exito de ataque del modelo original en el benchmark completo de 46 prompts es del 13,0%. No se ejecutaron benchmarks estandar (MMLU, HumanEval, GSM8K u otros) sobre este modelo.

## Requisitos de hardware

- VRAM para inferencia: el fichero F16 ocupa 7,78 GB (7,2 GiB) y requiere aproximadamente 8 GB de memoria o mas, segun la propia model card. Hay que sumar la cache KV del contexto utilizado, que con ventanas cercanas a los 131.072 tokens puede crecer varios GB adicionales; no se proporcionan cifras exactas.
- Cuantizaciones estimadas a partir del numero de parametros (no verificadas ni evaluadas por el autor): Q8_0 en torno a 4,1 GB, Q4_K_M en torno a 2,4 GB. La model card indica que las variantes cuantizadas no se han evaluado en comportamiento de rechazo ni en calidad.
- GPU recomendadas: cualquier GPU con 8 GB o mas puede ejecutar el F16, por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A100 o H100. Con cuantizaciones Q4 puede caber en GPUs de 4-6 GB.
- Cabe en GPU de consumo: si. En F16 en tarjetas de 8 GB o mas, y con cuantizacion propia en tarjetas de gama de entrada. Tambien puede ejecutarse en CPU con RAM suficiente.
- Opciones de despliegue: llama.cpp (`llama-cli -hf tirthfx/gemma-3-4b-it-ablated-GGUF -cnv`), Ollama (`ollama run hf.co/tirthfx/gemma-3-4b-it-ablated-GGUF`) y LM Studio. El repositorio solo publica GGUF, por lo que no hay checkpoint safetensors para vLLM o TGI; usarlos requeriria convertir el GGUF de vuelta, un proceso no soportado de forma limpia.
- Muestreo sugerido por el autor (de los metadatos del GGUF): `top_k = 64`, `top_p = 0.95`.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Comportamiento de rechazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| tirthfx/gemma-3-4b-it-ablated-GGUF | 3,88B | 131.072 | no (GGUF sin mmproj) | eliminado (100% ASR en subconjunto de 20 prompts) | gemma | solo GGUF F16 |
| google/gemma-3-4b-it | 3,88B | 131.072 | si, multimodal | intacto (15% ASR en el mismo subconjunto) | gemma | safetensors y GGUF de terceros |
| Qwen3-4B | ~4B | 32.768 nativos, ampliable | no | alineado, con modo de razonamiento | Apache 2.0 | safetensors y GGUF |
| Llama-3.2-3B-Instruct | 3,2B | 128.000 | no | alineado | Llama 3.2 Community License | safetensors y GGUF |

Los datos de Qwen3-4B y Llama-3.2-3B-Instruct proceden de sus model cards publicas y no de la informacion proporcionada en esta busqueda; se incluyen como referencia de categoria. No se dispone de comparaciones de rendimiento estandar entre estos modelos y el modelo abliterado, porque el autor no ejecuto MMLU ni otras evaluaciones comunes.

## Limitaciones y advertencias

- Elimina el rechazo de forma permanente: cumple con peticiones de cibercrimen, armas y fraude con un 100% de exito de ataque en el subconjunto evaluado. No es un modelo seguro ni alineado.
- Licencia Gemma y politica de uso prohibido: los terminos de Gemma restringen los usos daninos, por lo que el despliegue o la distribucion de sus salidas puede infringir la licencia ademas de ser eticamente inaceptable.
- No apto para produccion ni para productos de cara al usuario, ni para personas que deban quedar protegidas por las salvaguardas del modelo base.
- Ausencia de benchmarks estandar: no hay MMLU, HumanEval, GSM8K ni evaluaciones equivalentes. La afirmacion de "capacidades intactas" se apoya solo en una bateria de QA pequena y propia, no en evidencia solida.
- Evaluacion de ataque fragil: el benchmark es de autoria propia, con 46 prompts en 8 categorias, y la tasa de cumplimiento la puntua un juez basado en reglas (rechazo / cumplimiento / no respuesta), no un clasificador entrenado ni revision humana. "Cumplimiento" solo indica que no hubo rechazo y que la respuesta fue del tema, no que sea correcta o util.
- Artefacto sin validacion externa: 0 descargas y 1 "like"; no se declara revision por pares del artefacto en si.
- Incomparabilidad de alpha: este modelo usa proyeccion completa (alpha = 1.0) sobre los pesos, mientras que el barrido principal del paper usa una intervencion distinta en tiempo de ejecucion con forward hooks, donde alpha = 0.05 era el punto optimo y alpha >= 0.5 degradaba la salida a incoherencia. Los valores de alpha de ambas operaciones no son comparables.
- Perdida de multimodalidad: al no incluir mmproj, todo lo relacionado con imagen desaparece respecto al modelo base.
- Idiomas: solo se etiqueta ingles. El comportamiento en castellano u otras lenguas no esta verificado y puede degradarse.
- Cuantizaciones sin evaluar: cualquier Q4_K_M u otra variante generada por el usuario no ha sido comprobada en rechazo ni en calidad.
- Riesgo de alucinacion: no medido. Suprimir el rechazo no mejora la veracidad; el modelo puede afirmar con seguridad contenidos falsos, y ahora tambien sobre temas que antes evitaba.
- Sin garantia de cobertura total: no se documenta si quedan mecanismos de seguridad residuales ni como se comporta frente a categorias no incluidas en el benchmark (por ejemplo, autolesion o contenido sexual).
- Model card truncada: el README proporcionado se corta en la seccion de limitaciones ("Removing refusals does not make th..."), por lo que el resto de advertencias del autor no puede verificarse con la informacion disponible.
- Reproducibilidad limitada: el script que aplica la edicion no se publica intencionadamente en el repositorio de GitHub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tirthfx/gemma-3-4b-it-ablated-GGUF
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Paper del metodo (Arditi et al., 2024): https://arxiv.org/abs/2406.11717
- Repositorio del estudio de red-teaming: https://github.com/tirthfx/gemma-jailbreak-redteam
- Perfil del autor: https://huggingface.co/tirthfx
- Resultados de busqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a un sitio de anuncios clasificados sin relacion con el modelo.
