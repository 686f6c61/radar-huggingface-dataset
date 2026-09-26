# ZibinDong/ActionCodec2-1st-order

## Resumen

ActionCodec2-1st-order es un tokenizador de acciones de robot entrenado (ajustado) publicado por el usuario ZibinDong en Hugging Face. No es un modelo de lenguaje ni una red neuronal: es un artefacto de codec que transforma una trayectoria continua de acciones de robot en una secuencia de tokens enteros y la reconstruye de vuelta a una trayectoria aproximada. Su proposito es servir de puente entre los datos de control de robots (posiciones, rotaciones, pinza) y las arquitecturas autorregresivas tipo transformer, de modo que las acciones puedan tratarse como si fueran tokens de texto.

El artefacto esta pensado para entrenar o ejecutar politicas de robot autorregresivas y modelos VLA (vision-language-action). Esta vinculado por defecto al layout de accion `single_eef_delta` (delta de posicion del efector final, incremento de rotacion como vector de rotacion y comando de pinza), con un reloj objetivo de 15 Hz y un presupuesto de 4096 tokens por perfil. Ademas del perfil de efector final, incluye un perfil de articulaciones y 13 layouts registrados en total.

Su relevancia es practica: la tokenizacion de acciones es la pieza que permite reutilizar infraestructura de transformers (`AutoProcessor`, `input_ids`, `trust_remote_code`) en robodatos, y este artefacto se distribuye como un paquete autonomo con su propio runtime, sin necesidad de importar el repositorio fuente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec de tokenizacion de acciones (ActionCodec2, primitiva de orden 1). No es una red neuronal transformer |
| Parametros totales | no disponible (el repositorio no contiene un checkpoint de red neuronal) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica; presupuesto de 4096 tokens por perfil |
| Tipos de cuantizacion | Cuantizacion fisica de acciones y remuestreo temporal (ambos con perdida). No hay cuantizacion de pesos |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no aplica. Artefacto compuesto por `router_config.yaml`, `profiles/joint/`, `profiles/eef/`, `runtime/`, `processing_actioncodec2.py`, `config.json`, `processor_config.json` |

Otros datos tecnicos declarados:

| Parametro | Valor |
|---|---|
| Orden de primitiva | 1 |
| Espacio de accion seleccionado | `single_eef_delta` |
| Frecuencia del codec | 15 Hz (objetivo, con remuestreo desde el `fps` de origen) |
| Perfiles ajustados | joint, eef |
| Layouts registrados | 13 |
| Dimension de accion por defecto | 7 columnas |
| Fecha de creacion en el Hub | 2026-09-25 |
| Tamano del repositorio | 0.0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto implementa un codec de acciones que combina dos etapas: una cuantizacion fisica del vector de accion y un remuestreo temporal hacia un reloj objetivo de 15 Hz. El resultado del proceso de codificacion son tokens enteros; la decodificacion devuelve un tensor `torch.float32` en CPU con forma `(B, T_out, D)`, donde `T_out` puede diferir del numero de pasos de entrada. La model card no especifica el algoritmo de ajuste ni el numero de episodios o de tokens usado para ajustar los perfiles; unicamente indica que el codec se ajusta con `codec.fit(episodes, fps=15, backend="auto")` sobre el repositorio fuente cuando se quiere un espacio de accion distinto.

El layout por defecto, `single_eef_delta`, define tres bloques de columnas: `0:3` delta de posicion del efector final en metros por paso, `3:6` incremento de rotacion como vector de rotacion en radianes con convencion de cuerpo `R_next = R_previous @ Exp(rotvec)`, y `6` comando absoluto de pinza (abierta si es `>= 0.8`, cerrada en caso contrario). Las seis primeras columnas son incrementos por paso, no velocidades. Existen otros layouts registrados (joint, dual-arm, absolute y delta) seleccionables con `for_action_space(...)`, y los layouts absolutos requieren pasar `current_state` de forma `(B, D)` tanto en `encode` como en `decode`. La innovacion destacable es precisamente el contrato de espacio de accion: el artefacto obliga a respetar unidades fisicas y convenciones de rotacion y pinza, y rechaza conceptualmente features normalizadas genericas en `[-1, 1]`.

## Capacidades

- Tokenizacion de trayectorias continuas de acciones de robot a secuencias de tokens enteros (`encode`) y reconstruccion aproximada (`decode`).
- Integracion directa con la API de transformers mediante `AutoProcessor.from_pretrained(..., trust_remote_code=True)` y uso como procesador que devuelve `input_ids` en `features["input_ids"]`.
- Soporte de lotes con forma `(B, T, D)` siempre que todas las secuencias del lote compartan la misma `T`; las episodios de longitud variable deben codificarse por separado.
- Remuestreo temporal desde la frecuencia de origen indicada en `fps` hacia el reloj objetivo de 15 Hz.
- Multiples espacios de accion: 13 layouts registrados, con perfiles ajustados para articulaciones (joint) y efector final (eef).
- Introspeccion de layouts disponibles mediante `codec.print_action_spaces(action_dim=...)` y seleccion explicita con `for_action_space(...)`.
- Soporte de layouts absolutos mediante el parametro `current_state`.
- Ajuste de un codec propio sobre nuevos episodios con el repositorio fuente (`ActionCodec2(...).fit(...)` y `save_pretrained`), generando un artefacto recargable.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Entrenamiento de politicas de robot autorregresivas: convertir episodios de demostracion `(T, 7)` en secuencias de tokens enteros para entrenar un transformer que prediga el siguiente token de accion, reutilizando las utilidades de `input_ids` de la libreria transformers.
- Modelos VLA con backbone de lenguaje: intercalar tokens de accion con tokens de texto e imagen en una unica secuencia, de modo que el modelo pueda generar acciones y lenguaje con el mismo mecanismo de decodificacion autorregresiva.
- Unificacion de datasets heterogeneos: usar los 13 layouts registrados y el remuestreo a 15 Hz para expresar datos capturados a distintas frecuencias y con distintas convenciones de efector final o articulaciones en una representacion comun de tokens.
- Compresion de almacenamiento de robodatos: guardar las trayectorias como secuencias de enteros en lugar de tensores de flotantes, reduciendo el peso de los datasets de demostracion antes del entrenamiento.
- Ejecucion en bucle cerrado: decodificar los tokens predichos por la politica a una trayectoria ejecutable en el controlador, teniendo en cuenta que la reconstruccion es aproximada y que el numero de pasos decodificados puede diferir del de entrada.
- Adaptacion a un robot nuevo: ajustar un codec propio con `codec.fit(episodes, fps=15, backend="auto")` cuando el espacio de accion fisico del robot no encaje en ninguno de los perfiles preajustados, y publicar o cargar despues el artefacto resultante.
- Verificacion de integridad de pipelines de datos: usar `print_action_spaces` y las comprobaciones de contrato (orden de columnas, unidades, convencion de rotacion, umbral de pinza, frecuencia de grabacion) como paso de validacion antes de lanzar un entrenamiento a gran escala.
- Analisis offline de error de cuantizacion: comparar trayectorias originales y decodificadas para medir la perdida introducida por la cuantizacion fisica y el remuestreo temporal en un dataset concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El artefacto no es una red neuronal, por lo que la inferencia del codec es una operacion de cuantizacion y remuestreo: cabe holgadamente en CPU y no requiere VRAM dedicada.
- VRAM estimada: no disponible; en la practica, la codificacion y decodificacion de un lote de acciones `(B, T, D)` con `D` en torno a 7 consume memoria despreciable frente a cualquier modelo neuronal.
- GPU recomendadas: no aplica para el codec en si. En un pipeline VLA, la GPU la determina el modelo de politica que consuma los tokens, no este artefacto.
- GPU de consumo: si, cualquier maquina capaz de ejecutar numpy, scipy y torch puede usar el codec; no hay requisito de acelerador.
- Dependencias de despliegue: `numpy`, `scipy`, `torch`, `transformers>=4.57,<5`, `huggingface-hub` y `pyyaml`. El artefacto incluye su propio runtime, por lo que se carga con `trust_remote_code=True` sin importar el repositorio fuente.
- Servidores de inferencia tipo vLLM, llama.cpp, Ollama o TGI: no aplican a este artefacto, que se integra como procesador dentro del pipeline de transformers del modelo que lo utilice.
- Latencia y throughput: no disponibles. Al no ser un modelo neuronal, el coste dominante es el numero de pasos y la operacion de remuestreo, no el computo matricial.

## Comparativa con modelos similares

La informacion disponible no incluye resultados cuantitativos que permitan una comparacion numerica. A continuacion se contrastan enfoques de tokenizacion de acciones de la misma categoria, de forma cualitativa:

| Enfoque | Que es | Relacion con ActionCodec2-1st-order |
|---|---|---|
| ActionCodec2-1st-order | Codec de acciones con perfiles ajustados, 13 layouts registrados y reloj objetivo de 15 Hz | Objeto de esta ficha |
| FAST (tokenizador de acciones por transformada de frecuencia) | Esquema de tokenizacion de acciones para politicas autorregresivas | Alternativa conceptual; no se dispone de datos comparativos en la informacion proporcionada |
| VQ-BeT (tokenizacion vectorial-cuantizada de comportamiento) | Tokenizador de acciones basado en cuantizacion vectorial | Alternativa conceptual; no se dispone de datos comparativos en la informacion proporcionada |
| Discretizacion por bins por dimension (estilo RT-2 / OpenVLA) | Conversion directa de cada dimension de accion a bins discretos | Alternativa mas simple; no se dispone de datos comparativos en la informacion proporcionada |

Datos comparativos de parametros, contexto, rendimiento, licencia y disponibilidad de estas alternativas: no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion fisica y el remuestreo temporal son procesos con perdida: la trayectoria decodificada es una aproximacion y su numero de pasos puede diferir del de entrada.
- El artefacto esta vinculado por defecto al layout `single_eef_delta`; usar valores normalizados genericos en `[-1, 1]` sin convertirlos antes al contrato del espacio de accion produce resultados incorrectos.
- La forma del vector de accion no basta para elegir layout: hay que confirmar orden de columnas, unidades, convencion de rotacion, convencion de pinza y frecuencia de grabacion a partir del controlador o del dataset.
- La convencion de pinza es un umbral fijo en 0.8 (abierta si es mayor o igual); un robot con otra semantica de pinza requerira un codec reajustado.
- La rotacion se interpreta como incremento en marco del cuerpo con `R_next = R_previous @ Exp(rotvec)`; otras convenciones habituales (marco del mundo, angulos de Euler, cuaterniones) no son directamente compatibles sin conversion previa.
- Los layouts absolutos requieren pasar `current_state`; omitirlo en `encode` o en `decode` invalida la reconstruccion.
- El codec no puede procesar lotes con longitudes temporales distintas: hay que codificar los episodios de longitud variable por separado.
- Licencia no declarada: existe incertidumbre juridica sobre el uso comercial y sobre la redistribucion del artefacto o de modelos entrenados con el.
- La carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo incluido en el repositorio; conviene auditar los archivos del artefacto antes de usarlo en entornos de produccion.
- Dependencia de `transformers>=4.57,<5`, una ventana de versiones restrictiva que puede entrar en conflicto con otros componentes del entorno.
- Repositorio con 0 descargas y 0 likes, sin benchmarks publicados y con un tamano de repo declarado de 0.0 GB: se trata de un artefacto sin validacion externa conocida.
- Este artefacto cubre solo primitivas de orden 1; no incluye modelos de orden superior.
- No tiene capacidades de lenguaje, vision, audio, razonamiento, codigo, tool calling ni comportamiento agentico: es exclusivamente un codec de acciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZibinDong/ActionCodec2-1st-order
- Repositorio fuente de ActionCodec2 (mencionado en la model card para ajustar codecs propios): no disponible como URL en la informacion proporcionada
- Paper: no disponible
- Blog o demo: no disponible
