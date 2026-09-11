# yinita/ps4mas-0911-baseline

## Resumen

`yinita/ps4mas-0911-baseline` no es un modelo de lenguaje, sino un repositorio de artefactos de evaluacion. Su model card lo describe explicitamente como una subida automatica de resultados de evaluacion ("baseline eval results"), generada por el script `scripts/0911/upload_results_to_hf.py`. El contenido son ficheros de resultados organizados en directorios, no pesos de red neuronal: la propia tarjeta indica que se subieron 3 ficheros con un total de 0.0 MB y que los pesos grandes del modelo se omitieron ("0 skipped (large model weights)").

El proposito del repositorio es documentar evaluaciones de referencia sobre dos modelos base, `Qwen/Qwen3.5-9B` y `Qwen/Qwen3.5-27B`, sin ajuste fino adicional. Las evaluaciones se realizan sobre dos dominios denominados CASTLE (11 topologias en frio x 200 escenarios) y PENGUIN (16 topologias en frio x 200 escenarios), con ficheros de test concretos: `data/castle/castle_official_final_test.jsonl` y `data/sft_splits/final_test_scenarios.jsonl`.

La relevancia de este repositorio es acotada y de tipo metodologico: sirve como referencia de reproducibilidad para quien trabaje con el pipeline PS4MAS, pero no aporta ningun modelo desplegable. No se dispone de informacion sobre arquitectura, licencia, idiomas ni parametros del propio artefacto, y la busqueda web no ha devuelto ninguna fuente relacionada (los resultados obtenidos corresponden a paginas de soporte de Gmail, sin relacion con el repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica: el repositorio contiene resultados de evaluacion, no pesos. Layout de directorios: `castle_qwen9b_cold/`, `castle_qwen27b_cold/`, `penguin_qwen9b_cold/`, `penguin_qwen27b_cold/`, `scale_castle_final/`, `scale_penguin_final/` |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura ni entrenamiento del artefacto en si, porque no se trata de un modelo entrenado. Lo que describe la model card es un procedimiento de evaluacion: se toman dos modelos base (`Qwen/Qwen3.5-9B` y `Qwen/Qwen3.5-27B`) sin fine-tuning y se ejecutan sobre dos suites de escenarios. Los resultados se organizan cruzando modelo, dominio y "topologia en frio": 11 topologias para CASTLE y 16 para PENGUIN, con 200 escenarios por combinacion.

El unico detalle tecnico adicional declarado es el uso de un "mock judge" con puntuacion fija, es decir, un juez simulado que no depende de ningun modelo real de tipo OSS-120B. Esto implica que las puntuaciones registradas no son comparables con evaluaciones hechas con un juez real y deben interpretarse como un andamiaje de validacion del pipeline, no como una medicion de calidad de los modelos evaluados.

## Capacidades

- Almacenamiento y publicacion de resultados de evaluacion de los modelos base `Qwen/Qwen3.5-9B` y `Qwen/Qwen3.5-27B` sobre los dominios CASTLE y PENGUIN.
- Trazabilidad temporal: la tarjeta registra la fecha de subida inicial (2026-09-11 06:07:20) y la ultima actualizacion.
- Organizacion de resultados por modelo, dominio y topologia en frio, con dos experimentos adicionales de escala (`scale_castle_final`, `scale_penguin_final`) sobre el modelo de 9B.
- Ejecucion de evaluaciones con un juez simulado de puntuacion fija, util para probar el cableado del pipeline sin coste de inferencia de un juez externo.
- El repositorio no ofrece generacion de texto, razonamiento, codigo, vision, tool calling, capacidades de agente ni soporte multilingue, ya que no incluye modelo alguno.

## Casos de uso

- Reproducibilidad de evaluaciones baseline: un equipo que trabaje con el pipeline PS4MAS puede descargar este repositorio para comprobar que su ejecucion local produce la misma estructura de directorios y el mismo numero de escenarios por topologia (11 x 200 en CASTLE, 16 x 200 en PENGUIN).
- Auditoria de un juez simulado: dado que se declara explicitamente el uso de un mock judge con puntuacion fija, sirve como caso de prueba para verificar que un juez real posterior no hereda sesgos de escala ni comparaciones invalidas frente a estas referencias.
- Validacion del script de subida: el repositorio documenta el script `scripts/0911/upload_results_to_hf.py` y su comportamiento (3 ficheros, 0.0 MB, omision de pesos grandes), lo que permite probar flujos de publicacion automatica de resultados en HuggingFace.
- Comparacion de escalado 9B frente a 27B: los directorios emparejados `castle_qwen9b_cold` / `castle_qwen27b_cold` y `penguin_qwen9b_cold` / `penguin_qwen27b_cold` permiten estudiar el efecto del tamano del modelo base sobre el mismo conjunto de escenarios, siempre que el juez utilizado se sustituya por uno real.
- Integracion en un arnes de evaluacion continuo: el layout plano por modelo y dominio facilita consumir los resultados desde un script de CI que compare la ultima ejecucion con esta linea base y marque regresiones de estructura.
- Punto de partida para definir taxonomias de escenarios: las 11 topologias de CASTLE y las 16 de PENGUIN, con 200 escenarios cada una, pueden reutilizarse como esqueleto de un banco de pruebas propio antes de invertir en anotacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la estructura de carpetas de resultados y el numero de topologias y escenarios evaluados, pero no incluye ninguna puntuacion numerica. Ademas, al emplearse un juez simulado de puntuacion fija, cualquier cifra derivada de estas ejecuciones careceria de valor comparativo frente a benchmarks estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM para inferencia: no aplica. El repositorio contiene 3 ficheros con un total de 0.0 MB y ningun peso de modelo.
- GPU recomendadas: no disponible; no se requiere GPU para consumir este repositorio. La ejecucion de las evaluaciones originales requirio, en su momento, hardware capaz de servir `Qwen/Qwen3.5-9B` y `Qwen/Qwen3.5-27B`, pero no se especifica cual.
- Ejecucion en GPU de consumo: no aplica al repositorio. No hay informacion sobre si los modelos evaluados caben en GPU de consumo.
- Opciones de despliegue: no aplica; no se distribuyen pesos en formatos como safetensors, GGUF ni cuantizaciones para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Este repositorio no es un modelo, por lo que no procede una comparativa de rendimiento. A modo de contexto, la propia model card identifica los dos modelos base evaluados:

| Elemento | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yinita/ps4mas-0911-baseline` | Repositorio de resultados de evaluacion | no aplica | no aplica | no disponible | Publico en HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| `Qwen/Qwen3.5-9B` | Modelo base evaluado | no disponible (el identificador sugiere 9B) | no disponible | no disponible | Referenciado en la model card, no incluido en este repositorio |
| `Qwen/Qwen3.5-27B` | Modelo base evaluado | no disponible (el identificador sugiere 27B) | no disponible | no disponible | Referenciado en la model card, no incluido en este repositorio |

No se dispone de datos de rendimiento, licencia ni contexto de ninguno de los tres elementos mas alla de lo indicado.

## Limitaciones y advertencias

- No es un modelo utilizable: no contiene pesos, tokenizador ni configuracion de inferencia. Cualquier intento de cargarlo como modelo fallara.
- Las puntuaciones proceden de un mock judge con puntuacion fija; no miden la calidad real de `Qwen/Qwen3.5-9B` ni de `Qwen/Qwen3.5-27B` y no deben citarse como resultados de evaluacion validos.
- Ausencia total de informacion sobre licencia: no puede asumirse permiso de uso comercial, redistribucion ni derivacion de los resultados publicados.
- No se declaran idiomas soportados ni composicion de los escenarios (CASTLE y PENGUIN no se describen en la tarjeta), por lo que se desconoce que tarea se esta midiendo realmente.
- Los identificadores de modelo `Qwen/Qwen3.5-9B` y `Qwen/Qwen3.5-27B` no se corresponden con ninguna familia publicada conocida en el momento de redactar esta ficha; conviene verificar su existencia y procedencia antes de reutilizar cualquier conclusion.
- Cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad ni de que el pipeline se haya reproducido de forma independiente.
- La busqueda web no devolvio ninguna fuente relacionada con PS4MAS, CASTLE o PENGUIN; los resultados obtenidos fueron irrelevantes (paginas de soporte de Gmail), por lo que no hay documentacion externa que permita contextualizar el proyecto.
- Las fechas de creacion y actualizacion (2026-09-11) son posteriores al momento habitual de consulta; verificar la coherencia temporal antes de tratarlas como referencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yinita/ps4mas-0911-baseline
- Fichero de test de CASTLE citado en la model card: `data/castle/castle_official_final_test.jsonl` (ruta relativa, no se ha localizado URL publica)
- Fichero de test de PENGUIN citado en la model card: `data/sft_splits/final_test_scenarios.jsonl` (ruta relativa, no se ha localizado URL publica)
- Script de subida citado en la model card: `scripts/0911/upload_results_to_hf.py` (ruta relativa, no se ha localizado URL publica)
- Modelos base evaluados: `Qwen/Qwen3.5-9B` y `Qwen/Qwen3.5-27B` (referenciados en la model card; no se ha verificado su disponibilidad publica)
- Paper, blog, repositorio de codigo o demo de PS4MAS: no disponibles en la informacion proporcionada
