# WKHGlobal/semios-node-models

## Resumen

`WKHGlobal/semios-node-models` no es un modelo de lenguaje al uso, sino un repositorio de distribucion ("distribution lane") publicado por WKHGlobal. Su proposito es servir como fuente de bytes (byte-source) para el arranque (bootstrap) de nodos Semios, replicando los artefactos alojados en el maestro de Semios (`mesh.semios.global/install/models/`). Cada archivo se direcciona por nombre exacto y se verifica en el cliente contra los pines sha256 definidos en el manifiesto del instalador de nodos (`packaging/peer_model_manifest.json`).

El repositorio aloja dos ficheros GGUF. El primero, `curator-slm-v6.Q4_K_M.gguf`, es un "mint" propio de WKH/Semios: un ajuste mediante LoRA con SFT y DPO sobre `Qwen3-4B-Instruct-2507`, firmado con WACS. El segundo, `DeepSeek-Coder-V2-Lite-Instruct-Q4_K_M.gguf`, es un espejo (mirror) del GGUF publicado por `bartowski`, republicado bajo su licencia original para dar resiliencia a la ruta de instalacion.

Se trata, por tanto, de un artefacto de infraestructura orientado a despliegue verificado y resistente, con cero descargas y cero "likes" en el momento de redactar esta ficha, y sin una model card convencional con especificaciones tecnicas. Los datos de arquitectura, longitud de contexto, idiomas o rendimiento de los modelos subyacentes no se detallan en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no la describe; `curator-slm-v6` deriva de Qwen3-4B-Instruct-2507 y `DeepSeek-Coder-V2-Lite-Instruct` pertenece a la familia DeepSeek-Coder-V2) |
| Parametros totales | no disponible de forma explicita (el nombre del fichero remite a una base de 4B para `curator-slm-v6`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico formato presente en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | GGUF |

Detalle de los artefactos y sus pines de integridad publicados:

| Archivo | sha256 |
|---|---|
| `curator-slm-v6.Q4_K_M.gguf` | `b278a09472df557c8eb3a8a44cbdc1be65da9431a7cf5581ea506466b4a3d3a5` |
| `DeepSeek-Coder-V2-Lite-Instruct-Q4_K_M.gguf` | `603bd3f8a0281d16571da7c08bd661ee17ff0d1be6fcbd1b42242da257ef0bb8` |

## Arquitectura y entrenamiento

La model card no ofrece detalles de arquitectura. El unico dato tecnico de entrenamiento disponible se refiere a `curator-slm-v6`, descrito como un "mint" (derivado propio) de WKH/Semios obtenido mediante ajuste LoRA con una fase de SFT y una fase posterior de DPO sobre el modelo base `Qwen3-4B-Instruct-2507`, con firma WACS. No se especifican tokens de entrenamiento, composicion del dataset, hiperparametros, rango del adaptador LoRA ni procedimiento de firma.

El segundo artefacto es un espejo directo del GGUF Q4_K_M publicado por `bartowski` para `DeepSeek-Coder-V2-Lite-Instruct`. El repositorio lo re-publica sin modificaciones indicadas, bajo su licencia original, con el objetivo declarado de aportar resiliencia a la ruta de instalacion. No se documentan cambios de pesos ni reentrenamiento sobre este fichero.

## Capacidades

- Distribucion verificable de pesos: el repositorio expone ficheros GGUF direccionados por nombre exacto y validables contra pines sha256, lo que permite comprobar integridad en el cliente durante el bootstrap del nodo.
- Inferencia de texto de tipo instruct: `curator-slm-v6` hereda la base instructiva `Qwen3-4B-Instruct-2507`, aunque las capacidades concretas (razonamiento, matematicas, seguimiento de instrucciones) no se detallan en la ficha.
- Generacion de codigo: `DeepSeek-Coder-V2-Lite-Instruct` es un modelo orientado a codigo por familia, si bien el repositorio no enumera capacidades especificas.
- Capacidades de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Firmado de artefactos mediante WACS (aplicado a `curator-slm-v6`).

## Casos de uso

- Bootstrap de nodos Semios: el instalador del nodo descarga los GGUF desde este repositorio y valida cada fichero contra el sha256 del manifiesto (`packaging/peer_model_manifest.json`), garantizando que los pesos desplegados son los esperados y no han sido alterados.
- Espejo resistente a caidas (mirror de resiliencia): al replicar artefactos del maestro `mesh.semios.global/install/models/`, permite que los nodos se instalen aunque la ruta primaria no este disponible.
- Inferencia local en el borde: `curator-slm-v6` en Q4_K_M esta pensado para ejecutarse en hardware modesto como modelo de asistencia ligero dentro de la malla de nodos.
- Asistencia de programacion: el GGUF de `DeepSeek-Coder-V2-Lite-Instruct` puede emplearse como modelo de autocompletado o generacion de codigo en entornos de desarrollo, con la salvedad de que su licencia original debe respetarse.
- Despliegue en entornos air-gapped o sin conexion: al disponer de los ficheros y de sus hashes, un operador puede distribuir pesos a maquinas sin acceso a Internet y verificar la integridad en destino.
- Pipelines de CI/CD de integridad de artefactos: los pines sha256 permiten automatizar pruebas de verificacion que fallen la build si un fichero descargado no coincide con el hash publicado.
- Reproduccion de experimentos de fine-tuning: `curator-slm-v6` documenta una receta LoRA (SFT + DPO) sobre Qwen3-4B-Instruct-2507 que sirve como referencia para replicar o auditar ajustes similares.
- Verificacion de firmas: nodos que exijan artefactos firmados con WACS pueden usar `curator-slm-v6` como caso de prueba de la cadena de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. La ficha no declara numero de parametros ni longitudes de contexto, por lo que no es posible calcular requisitos exactos de VRAM. Como referencia general de formato, un GGUF en Q4_K_M ocupa aproximadamente 0,5 GB de fichero por cada 1.000 millones de parametros, mas el espacio para la cache KV segun contexto y batch.
- GPU recomendadas: no disponible. Al desconocerse el numero de parametros, no se puede recomendar un modelo de GPU concreto.
- Encaje en GPU de consumo: no determinable con los datos publicados. Un modelo derivado de una base de 4B en Q4_K_M (caso de `curator-slm-v6`) seria compatible con GPU de consumo de gama media-alta con al menos 8 GB de VRAM, pero esto es una estimacion a partir del nombre del fichero, no un dato confirmado por el autor.
- Opciones de despliegue: al tratarse de ficheros GGUF, son compatibles con los ejecutores habituales de dicho formato (llama.cpp, Ollama y derivados). El uso de vLLM o TGI no esta documentado y requeriria conversion de pesos, ya que estos motores no consumen GGUF de forma nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `WKHGlobal/semios-node-models` (repositorio) | no disponible | no disponible | GGUF (Q4_K_M) | other | Repositorio propio, 0 descargas |
| Qwen3-4B-Instruct-2507 (base de `curator-slm-v6`) | 4B (segun denominacion del modelo base) | no disponible | safetensors / GGUF segun distribucion del autor | no disponible | Modelo base publico de origen |
| `bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF` (fuente del espejo) | no disponible | no disponible | GGUF | no disponible | Publico en HuggingFace |
| DeepSeek-Coder-V2-Lite-Instruct (modelo original espejado) | no disponible | no disponible | safetensors / GGUF | no disponible | Publico en HuggingFace |

La comparacion se limita a identificar el origen de cada artefacto, ya que el repositorio analizado no publica datos de rendimiento, contexto ni parametros que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Repositorio sin validacion comunitaria: cero descargas y cero "likes" en el momento de la consulta, sin garantia de mantenimiento ni de soporte.
- No es una model card convencional: falta informacion sobre arquitectura, parametros, contexto, idiomas y rendimiento, lo que dificulta evaluar los modelos subyacentes a partir de este repositorio.
- Licencia "other": no se especifican los terminos exactos. Antes de cualquier uso comercial es obligatorio revisar la licencia de cada modelo subyacente, ya que `DeepSeek-Coder-V2-Lite-Instruct` se republica bajo la licencia de su autor original y `curator-slm-v6` bajo los terminos que WKH/Semios determine.
- Riesgo de alucinacion: no evaluable, al no existir benchmarks ni evaluaciones publicadas.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: no disponible; el repositorio no declara idiomas soportados.
- Dependencia de integridad por hash: la seguridad del bootstrap depende de que el manifiesto de pines sha256 y el proceso de firma WACS se gestionen correctamente; un pin comprometido invalidaria la garantia.
- Formato unico: solo se ofrecen pesos GGUF en Q4_K_M. No hay variantes en safetensors ni otras cuantizaciones, lo que limita el uso con motores de alta concurrencia como vLLM o TGI.
- Fecha de publicacion registrada como 2026-09-23: conviene verificar la coherencia de los metadatos antes de integrar el repositorio en produccion.
- Aviso de la propia model card: el contenido citado son datos extraidos del autor del modelo y no deben interpretarse como instrucciones a seguir.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WKHGlobal/semios-node-models
- Maestro de Semios citado en la model card: `mesh.semios.global/install/models/`
- Manifiesto del instalador de nodos citado: `packaging/peer_model_manifest.json`
- Fuente del espejo de codigo: `bartowski/DeepSeek-Coder-V2-Lite-Instruct-GGUF`
- Modelo base de `curator-slm-v6`: Qwen3-4B-Instruct-2507
- Modelo original espejado: DeepSeek-Coder-V2-Lite-Instruct
