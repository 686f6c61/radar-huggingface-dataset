# tablinum/MagicEightBall-FP32

## Resumen

MagicEightBall FP32 Base es un artefacto ONNX de 1.832 bytes publicado por el usuario tablinum que implementa una politica de soporte fija como grafo denso en FP32. No es un modelo de lenguaje en el sentido habitual: se trata de un motor de reglas compilado que lee siete hechos de entrada (facts) en coma flotante y devuelve siete salidas booleanas en el mismo formato, acompanado de un runner en CPU y de un tokenizador compartido (Cactus Compute Needle 3, Apache-2.0) que permite procesar texto de hasta 131.072 tokens. La logica de decision es deterministica y se limita a detectar frases declaradas en la politica (por ejemplo, "Duplicate charge" para la categoria `billing`).

El modelo resuelve un problema muy acotado: clasificar una peticion de soporte en una categoria y proponer una accion, con capacidad de veto explicita ("Do not route.") que anula la accion propuesta. Su relevancia no esta en el rendimiento cognitivo, sino en la trazabilidad y el coste: al ser un grafo ONNX de menos de 2 KB, se puede ejecutar en CPU, en un Intel NCS1 o en cualquier entorno con `onnxruntime`, sin GPU ni dependencias pesadas. La verificacion publicada cubre las 128 asignaciones de hechos posibles, 128 fixtures de texto corto, dos documentos en el limite exacto de contexto y el rechazo a 131.073 tokens.

Conviene subrayarlo: pese a las etiquetas `decision-model` y `rule-engine`, no hay pesos neuronales entrenados, ni transformer, ni parametros en el sentido habitual. Es una referencia booleana densa, compilada a partir de reglas de soporte, pensada como linea base reproducible frente a la que comparar variantes mas complejas (ONNX, GGUF, nativa para NCS1).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grafo ONNX denso de reglas (rule engine compilado); no es un transformer |
| Parametros totales | no disponible (el artefacto pesa 1.832 bytes; no se declara numero de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens (Needle 3); rechazo verificado a 131.073 tokens |
| Tipos de cuantizacion | FP32 (unica variante en este repo); existen variantes ONNX y GGUF en repos hermanos |
| Idiomas soportados | en (ingles) |
| Licencia | MIT (reglas y runner) + Apache-2.0 (tokenizador Needle 3); declarada como `mit-and-apache-2.0` |
| Formato de pesos | ONNX (`model.onnx`, FP32 denso) |

## Arquitectura y entrenamiento

No hay entrenamiento. El grafo ONNX se compila directamente a partir de las reglas de la politica de soporte y opera en FP32 de extremo a extremo: recibe siete hechos en coma flotante y emite siete booleanos en coma flotante. La entrada textual se tokeniza con el tokenizador Needle 3 (reempaquetado sin perdida desde Cactus Compute, licencia Apache-2.0) y el runner en CPU (`portable_runtime.py`, dependencias `numpy`, `sentencepiece`, `onnxruntime`) se encarga de mapear texto a hechos y hechos a salidas.

La innovacion tecnica, en la medida en que la hay, es de empaquetado y verificacion: un artefacto de 1.832 bytes con un informe de verificacion (`verification.json`) que cubre exhaustivamente el espacio de entrada booleano (128 asignaciones), 128 fixtures de texto, dos documentos en el limite exacto de contexto y un caso de rechazo por exceso. El tokenizador se distribuye con procedencia documentada (`NOTICE.txt`) y sumas de comprobacion (`SHA256SUMS.txt`). No se declaran datos de entrenamiento, RLHF ni DPO porque no existen en este artefacto.

## Capacidades

- Clasificacion booleana determinista de peticiones de soporte segun una politica fija de frases declaradas.
- Asignacion de categoria (por ejemplo, `billing`) y propuesta de accion (por ejemplo, `review_billing`) devueltas como datos para revision humana.
- Veto explicito: la frase "Do not route." anula la accion propuesta y devuelve `may_route=false`, manteniendo la categoria.
- Manejo de entradas no relacionadas: devuelve sin categoria ni accion.
- Procesamiento de documentos largos hasta 131.072 tokens con rechazo controlado por encima del limite.
- Ejecucion en CPU y en hardware embebido (Intel NCS1) mediante el runner incluido.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- Multilingue: no; solo ingles (`en`).

## Casos de uso

- Triaje de tickets de facturacion: el modelo detecta frases como "Duplicate charge" y propone `review_billing`, lo que permite enrutar automaticamente tickets de facturacion a la cola adecuada sin coste de inferencia apreciable (grafo de 1.832 bytes en CPU).
- Filtro de veto en pipelines de soporte: insertar la comprobacion "Do not route." como guarda antes de cualquier enrutamiento automatico, de modo que un operador pueda anular la accion con una frase explicita y el sistema respete la decision.
- Linea base reproducible para evaluacion de modelos de decision: al cubrir exhaustivamente las 128 asignaciones booleanas, sirve como referencia contra la que medir variantes ONNX, GGUF o nativas en pruebas de regresion.
- Despliegue en hardware embebido o edge: su tamano y su ejecucion en NCS1 lo hacen apto para dispositivos sin GPU donde no cabe un modelo neuronal, por ejemplo terminales de punto de venta o pasarelas de soporte.
- Preprocesado de documentos largos: con 131.072 tokens de ventana puede procesar conversaciones o expedientes completos antes de pasarlos a un modelo mayor, actuando como primera etapa de clasificacion barata.
- Validacion de contratos de politica: el informe `verification.json` permite auditar que la politica compilada se comporta como se espera en todos los casos booleanos, util en entornos regulados donde se exige trazabilidad de la logica de decision.
- Prototipado rapido de reglas de negocio: compilar reglas a un grafo ONNX de pocos bytes facilita iterar sobre la politica sin reentrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta resultados de verificacion funcional: 128 asignaciones de hechos, 128 fixtures de texto corto, dos documentos en el limite exacto de 131.072 tokens y rechazo correcto a 131.073 tokens, todo con verificacion en CPU superada. Se enlazan tiempos medidos de CPU y NCS1 en la pagina del modelo nativo, pero no se reproducen cifras en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El artefacto ONNX ocupa 1.832 bytes y el runner depende de `numpy`, `sentencepiece` y `onnxruntime`.
- GPU recomendadas: ninguna; no se requiere acelerador.
- Consumer GPU: irrelevante; cabe en cualquier CPU moderna y en hardware embebido como el Intel NCS1.
- Opciones de despliegue: `onnxruntime` en CPU mediante `portable_runtime.py`; variantes ONNX y GGUF publicadas en repos hermanos para otros runtimes.
- Latencia y throughput: no disponibles en la informacion proporcionada; la model card remite a una comparativa de tiempos CPU y NCS1 en la pagina del modelo nativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| MagicEightBall FP32 Base | no disponible (1.832 bytes) | 131.072 tokens | ONNX FP32 | MIT + Apache-2.0 | Reglas compiladas, sin entrenamiento |
| MagicEightBall ONNX | no disponible | no disponible | ONNX | MIT + Apache-2.0 | Variante del mismo autor |
| MagicEightBall GGUF | no disponible | no disponible | GGUF | MIT + Apache-2.0 | Variante del mismo autor |
| MagicEightBall (nativo NCS1) | no disponible | no disponible | Nativo NCS1 | MIT + Apache-2.0 | Variante para Intel NCS1 con packs sectoriales |

No se dispone de modelos comparables de otros autores en la informacion proporcionada. Las unicas alternativas documentadas son las variantes del mismo autor, por lo que la comparativa con modelos de la misma categoria (motores de reglas o clasificadores ligeros) queda como no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no razona y no generaliza; solo reconoce las frases declaradas en la politica.
- Cobertura limitada al ingles y a las frases exactas de la politica; parafrasis o variaciones no declaradas pueden no detectarse.
- Riesgo de falsos negativos y positivos derivado de la coincidencia de frases, no de comprension semantica.
- La accion propuesta es un dato para revision, no una decision final; el autor lo indica explicitamente.
- Licencia mixta: reglas y runner bajo MIT, tokenizador bajo Apache-2.0; conviene revisar `LICENSE` y `NOTICE.txt` antes de uso comercial.
- El limite de contexto es estricto: se rechaza a 131.073 tokens, lo que exige control de longitud en produccion.
- Sin benchmarks publicados: no hay evidencia de rendimiento mas alla de la verificacion funcional.
- El repositorio no declara pipeline ni numero de parametros, lo que dificulta comparaciones cuantitativas con otros sistemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/MagicEightBall-FP32
- Modelo nativo NCS1 y packs sectoriales: https://huggingface.co/tablinum/MagicEightBall
- Variante ONNX: https://huggingface.co/tablinum/MagicEightBall-ONNX
- Variante GGUF: https://huggingface.co/tablinum/MagicEightBall-GGUF
- Informe de verificacion: https://huggingface.co/tablinum/MagicEightBall-FP32/blob/main/verification.json
- Licencia: https://huggingface.co/tablinum/MagicEightBall-FP32/blob/main/LICENSE
- Procedencia del tokenizador: https://huggingface.co/tablinum/MagicEightBall-FP32/blob/main/NOTICE.txt
- Sumas de comprobacion: https://huggingface.co/tablinum/MagicEightBall-FP32/blob/main/SHA256SUMS.txt
