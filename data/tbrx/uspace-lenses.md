# tbrx/uspace-lenses

## Resumen

`tbrx/uspace-lenses` no es un modelo de lenguaje, sino un repositorio de artefactos de interpretabilidad: dos lentes jacobianas (Jacobian lenses) autoajustadas para checkpoints concretos que no disponían de lente publicada. El paquete lo publica el usuario tbrx y da soporte al trabajo sobre incertidumbre U-Space, cuyo código vive en `github.com/nils-loose/vfield-mi` (rama `iclr27-artifact`). Cada lente es, en la práctica, una matriz de transporte lineal por bloque de transformer que permite proyectar el estado oculto de salida de un bloque al espacio de vocabulario.

El repositorio contiene dos ficheros `.pt`: `olmo_think_jacobian_lens.pt`, ajustado sobre `allenai/Olmo-3-32B-Think` (64 bloques, `d_model` 5120), y `gemma4it_selffit_jacobian_lens.pt`, ajustado sobre `google/gemma-4-31B-it` (60 bloques, `d_model` 5376). Ambos se han ajustado siguiendo la implementación de referencia de Anthropic (`anthropics/jacobian-lens`, Apache-2.0), con cotangentes one-hot en cada posición objetivo válida, sumados sobre objetivos, promediados sobre posiciones de origen y prompts, y descartando las primeras 16 posiciones por actuar como sumideros de atención.

Su relevancia es acotada pero específica: las lentes publicadas por AI2 están ajustadas sobre checkpoints *base*, mientras que el checkpoint de razonamiento es `-Think`, y una lente debe corresponderse con el checkpoint del que proceden los estados. El fichero de Gemma se ajustó como control frente a la lente publicada de `gemma-4-31B`, que se verificó posteriormente como correcta; no pretende sustituirla. El repositorio no registra descargas ni likes y ocupa 0,6 GB según los metadatos de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo neuronal; son matrices de transporte lineal (lentes jacobianas) asociadas a bloques de transformers existentes. Cada lente es un tensor `[d_model, d_model]` en fp32 |
| Parametros totales | 275.578.880 en total (derivado de `d_model`: 26.214.400 por bloque x 5 bloques en el fichero de Olmo = 131.072.000; 28.901.376 por bloque x 5 bloques en el de Gemma = 144.506.880) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la lente no tiene ventana de contexto propia; opera sobre estados ocultos del checkpoint objetivo |
| Tipos de cuantizacion | No disponible. Los tensores se almacenan en fp32; no se publican variantes cuantizadas |
| Idiomas soportados | No aplica al artefacto. El ajuste uso 100 prompts de wikitext-103 (corpus en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (serializacion `torch.save`; el fichero contiene un diccionario `{"J": {bloque: tensor}}` y requiere `weights_only=False` al cargar) |

Detalle por fichero:

| Fichero | Checkpoint objetivo | Bloques ajustados | Profundidad relativa | Prompts | d_model |
|---|---|---|---|---|---|
| `olmo_think_jacobian_lens.pt` | `allenai/Olmo-3-32B-Think` (64 bloques) | 38, 42, 47, 50, 54 | 0,609 / 0,672 / **0,750** / 0,797 / 0,859 | 100 (wikitext-103) | 5120 |
| `gemma4it_selffit_jacobian_lens.pt` | `google/gemma-4-31B-it` (60 bloques) | 36, 39, 44, 47, 50 | 0,617 / 0,667 / **0,750** / 0,800 / 0,850 | 100 (wikitext-103) | 5376 |

## Arquitectura y entrenamiento

Una lente jacobiana es un operador lineal que transporta la salida de un bloque `b` (indice `b+1` en la secuencia de estados ocultos) hasta el espacio de vocabulario, de modo que la profundidad relativa de un bloque se define como `(b+1)/n_blocks`. La dirección de token para un elemento de vocabulario `v` se obtiene como `norm((W_U[v] * gamma) @ J[b])`, donde `J[b]` es la matriz ajustada para ese bloque, `W_U` la matriz de desanclaje y `gamma` el factor de normalizacion correspondiente del checkpoint.

El procedimiento de ajuste sigue la implementacion de referencia de Anthropic: cotangentes one-hot en cada posicion objetivo valida, suma sobre objetivos, promedio sobre posiciones de origen y prompts, y descarte de las primeras 16 posiciones por su comportamiento de sumidero de atencion. El coste de ajuste esta dominado por el numero de capas, ya que cada capa implica un acumulador `d_model²` en fp32 que se toca en cada paso hacia atras; por ese motivo solo se ajustaron las profundidades que realmente se iban a leer (cinco por modelo), en lugar de una banda contigua. No se documento ningun proceso de RLHF, DPO ni ajuste por instrucciones: el artefacto no es un modelo entrenado, sino un ajuste post hoc sobre representaciones de checkpoints ya entrenados.

La implementacion de referencia recomienda del orden de 1000 prompts y senala que la calidad se satura cerca de 100. Estos ficheros usan 100 prompts, por lo que son utilizables pero quedan en el extremo bajo de esa horquilla. Para ajustar capas adicionales existe `fit_lens.py` en la rama `iclr27-artifact` del repositorio `nils-loose/vfield-mi`.

## Capacidades

- Proyeccion de estados ocultos al espacio de vocabulario: permite leer que direcciones de token estan presentes en la salida de un bloque concreto, a profundidades relativas entre 0,609 y 0,859 (Olmo) y entre 0,617 y 0,850 (Gemma).
- Lectura a profundidad relativa 0,750 en ambos modelos, la unica profundidad presente en los dos ficheros y por tanto la unica comparable directamente entre familias.
- Analisis de incertidumbre: es el proposito declarado del ajuste, enmarcado en el trabajo U-Space sobre campos de incertidumbre.
- Interpretabilidad comparada: permite contrastar representaciones intermedias entre `allenai/Olmo-3-32B-Think` y `google/gemma-4-31B-it` a la misma profundidad relativa.
- Soporte de checkpoints de razonamiento: la lente de Olmo esta ajustada especificamente sobre la variante `-Think`, no sobre el checkpoint base.
- Generacion de texto: no aplica, el artefacto no genera nada por si mismo.
- Tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica al artefacto; depende del checkpoint sobre el que se aplique.
- Capacidades multilingues: no disponible; el ajuste se hizo solo con prompts en ingles.
- Vision, audio: no aplica.

## Casos de uso

- Analisis de incertidumbre en modelos de razonamiento: aplicar `olmo_think_jacobian_lens.pt` sobre los estados de `Olmo-3-32B-Think` para leer como evoluciona la distribucion de direcciones de token en las capas intermedias y detectar senales tempranas de duda. Es el caso para el que se ajustaron las lentes.
- Auditoria de la diferencia entre checkpoint base y checkpoint de razonamiento: el autor senala explicitamente que las lentes publicadas de AI2 corresponden a checkpoints base y que una lente debe coincidir con el checkpoint del que salen los estados; este fichero cubre ese hueco para la variante `-Think`.
- Deteccion temprana de alucinacion: transportar los estados a profundidad relativa 0,750 y examinar las direcciones de vocabulario dominantes permite inspeccionar la hipotesis que el modelo esta construyendo antes de emitir el token final, util en pipelines de validacion de respuestas.
- Reproducibilidad de artefactos de investigacion: reproducir los resultados del trabajo U-Space usando la rama `iclr27-artifact` y las mismas cinco profundidades por modelo, con `J[b]` cargado directamente del repositorio.
- Control experimental: `gemma4it_selffit_jacobian_lens.pt` sirve como control frente a la lente publicada de `gemma-4-31B`; permite verificar que el pipeline de ajuste propio reproduce la lente de referencia antes de confiar en ajustes nuevos.
- Comparacion cruzada de familias de modelos: con ambos ficheros y la profundidad relativa 0,750 comun se pueden contrastar representaciones de dos familias distintas (32B y 31B) bajo el mismo protocolo de transporte.
- Extension a capas adicionales: para cualquier profundidad no incluida, reajustar con `fit_lens.py` e integrar el resultado en el mismo esquema de diccionario `{"J": {bloque: tensor}}`, reutilizando el codigo de lectura existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para las lentes en si: practicamente despreciable. Los tensores suman 1.102.315.520 bytes (aproximadamente 1,03 GiB) en fp32, cargables con `map_location="cpu"`; 500 MiB para el fichero de Olmo y 551 MiB para el de Gemma.
- GPU recomendadas: ninguna en concreto; el ajuste y la lectura de la lente pueden ejecutarse en CPU. El coste real de hardware lo impone el checkpoint objetivo sobre el que se aplique la lente.
- Coste del checkpoint objetivo: para ejecutar `Olmo-3-32B-Think` (32B) o `gemma-4-31B-it` (31B) en precision bf16 hacen falta del orden de 64 GB y 62 GB de VRAM respectivamente (estimacion estandar de 2 bytes por parametro); en cuantizacion de 4 bits el orden de magnitud baja a unos 16-20 GB, lo que los situa en el limite de GPU de consumo como la RTX 4090 (24 GB) solo con cuantizacion agresiva.
- Cabe en GPU de consumo: el artefacto si, cualquier GPU o incluso CPU. Los checkpoints objetivo solo de forma parcial y con cuantizacion.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`, `weights_only=False`) y `huggingface_hub.hf_hub_download`. No es desplegable en vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo generativo.
- Latencia y throughput: no disponible. La operacion relevante es un producto matricial `[d_model] x [d_model, d_model]` por bloque y token, mas la normalizacion de la direccion de token.

## Comparativa con modelos similares

La categoria de comparacion son otras lentes jacobianas, no modelos de lenguaje.

| Artefacto | Checkpoint objetivo | Bloques incluidos | Profundidad relativa 0,750 | Prompts de ajuste | Licencia |
|---|---|---|---|---|---|
| `tbrx/uspace-lenses` (`olmo_think`) | `allenai/Olmo-3-32B-Think` | 5 (38, 42, 47, 50, 54) | Si | 100 | Apache-2.0 |
| `tbrx/uspace-lenses` (`gemma4it_selffit`) | `google/gemma-4-31B-it` | 5 (36, 39, 44, 47, 50) | Si | 100 | Apache-2.0 |
| Lentes publicadas de AI2 | Checkpoints *base* de Olmo | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |
| Lente publicada de `gemma-4-31B` | `google/gemma-4-31B` | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible |

Diferencias clave: las lentes de AI2 se ajustan sobre checkpoints base y no cubren la variante `-Think`; la lente publicada de Gemma fue verificada como correcta, de modo que el fichero `gemma4it_selffit` es un control y no un reemplazo. Como desventaja frente a las publicadas, este repositorio aporta solo cinco bloques por modelo y con 100 prompts en lugar de los aproximadamente 1000 recomendados.

## Limitaciones y advertencias

- Cobertura parcial: solo hay cinco bloques por modelo y no forman una banda contigua. Cualquier otra capa lanza `KeyError`; hay que reajustar con `fit_lens.py` si se necesita otra profundidad.
- Numero de prompts bajo: 100 frente a los aproximadamente 1000 que sugiere la implementacion de referencia, que ademas indica que la calidad se satura cerca de 100. El autor califica estas lentes como utilizables pero en el extremo bajo de calidad.
- Ambiguedad en el tamano del repositorio: los metadatos de HuggingFace indican 0,6 GB, mientras que la suma de los tensores descritos (`d_model²` x 5 bloques x 4 bytes por fichero) da aproximadamente 1,03 GiB. Conviene verificar el contenido real antes de asumir el tamano.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta, con un unico autor, lo que implica ausencia de revision externa.
- Dependencia del checkpoint: la lente de Olmo solo es valida para `allenai/Olmo-3-32B-Think`; usarla con el checkpoint base o con otro modelo produce lecturas sin sentido, porque la lente debe coincidir con el checkpoint del que proceden los estados.
- Carga insegura: el fichero requiere `weights_only=False` en `torch.load`, lo que implica deserializacion de objetos arbitrarios. No cargar ficheros `.pt` de origen no fiable en entornos de produccion.
- Alcance idiomatico no verificado: el ajuste uso exclusivamente prompts en ingles de wikitext-103; no hay evidencia sobre el comportamiento de las direcciones de token en otros idiomas.
- Sesgos: no se documentan sesgos propios del artefacto, pero las lecturas heredan los sesgos del checkpoint subyacente y del corpus de calibracion empleado.
- Riesgo de mala interpretacion: la lente no genera texto y no puede alucinar por si misma; el riesgo es de lectura incorrecta de las direcciones de vocabulario por parte del analista.
- Licencia: el artefacto es Apache-2.0, lo que en principio permite uso comercial. No obstante, el uso practico requiere cargar los checkpoints objetivo, cuyas licencias no se detallan en la informacion proporcionada y deben verificarse por separado antes de cualquier explotacion comercial.
- Estado de investigacion: forma parte de un artefacto asociado a una rama concreta (`iclr27-artifact`) de un repositorio de investigacion, sin garantias de mantenimiento ni de estabilidad de la API.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tbrx/uspace-lenses
- Implementacion de referencia de Anthropic para Jacobian lenses: https://github.com/anthropics/jacobian-lens
- Repositorio del trabajo U-Space: https://github.com/nils-loose/vfield-mi (rama `iclr27-artifact`)
- Script de reajuste de lentes: https://github.com/nils-loose/vfield-mi/blob/iclr27-artifact/artifact/src/uspace/fit_lens.py
- Checkpoint objetivo de la primera lente: `allenai/Olmo-3-32B-Think`
- Checkpoint objetivo de la segunda lente: `google/gemma-4-31B-it`

Nota sobre la busqueda web: los resultados devueltos no guardan relacion con el modelo ni con lentes jacobianas (corresponden a sitios de anuncios funebres y a una entrada de vocabulario en italiano), por lo que no se incluyen como fuentes. No se han encontrado papers, blogs ni demos adicionales sobre este repositorio en la informacion disponible.
