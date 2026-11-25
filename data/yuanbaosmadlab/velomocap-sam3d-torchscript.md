# YuanBaoSMadLab/velomocap-sam3d-torchscript

## Resumen

`velomocap-sam3d-torchscript` es una conversion a TorchScript del modelo SAM 3D Body de Meta (variante DINOv3), publicada por el equipo de VeloMocap (YuanBaoSMadLab). No se trata de un modelo de lenguaje, sino de un modelo de vision tridimensional para captura de movimiento humano: reconstruye cuerpo, manos, geometria de malla y camara a partir de imagenes. El repositorio empaqueta el pipeline completo (backbone, ambas manos, fusion y geometria MHR) en un unico grafo TorchScript en fp32, junto con las tablas de topologia que VeloMocap usa para renderizar.

La relevancia de esta ficha es acotada y muy especifica: no es un modelo nuevo ni un fine-tuning, sino un artefacto de despliegue. El autor declara explicitamente que no se ha reentrenado, ajustado ni podado nada; el unico cambio es la trazabilidad a TorchScript y el empaquetado de las tablas MHR. Esto lo convierte en una pieza de infraestructura para quien quiera ejecutar SAM 3D Body con LibTorch (no con ONNX Runtime) dentro de una instalacion de VeloMocap.

El repositorio ocupa 10,4 GB e incluye tres grafos principales (completo, solo cuerpo y variantes con batch 8) mas ficheros auxiliares de malla, keypoints y esqueleto. La licencia es la SAM License, que permite uso comercial siempre que el texto de la licencia acompanie a los ficheros. No hay datos publicados de benchmarks propios, idiomas soportados ni pipeline declarado en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 3D Body con backbone DINOv3, trazado a TorchScript (grafo unico: backbone, manos, fusion y geometria MHR) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible; los pesos publicados estan en fp32 |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | SAM License (`sam-license`), uso comercial permitido con el texto de licencia incluido |
| Formato de pesos | TorchScript (`.pt`), tablas binarias (`.bin`) y JSON (`.json`); no hay safetensors ni GGUF |

Ficheros publicados:

| Fichero | Tamano | Contenido |
|---|---|---|
| `sam3d_full_b8_ts.pt` | 3,3 GB | Grafo completo trazado con `--batch 8` (hasta 8 personas por llamada) |
| `sam3d_body_b8_ts.pt` | 3,1 GB | Grafo `--hands body --batch 8`, solo cuerpo sin recortes de manos |
| `sam3d_full_ts.pt` | 3,3 GB | Grafo completo en batch 1 |
| `sam3d_faces.bin` | 432,1 KB | Tabla de caras de la topologia MHR |
| `sam3d_keypoints.bin` | 6,4 KB | Tabla de keypoints |
| `sam3d_skeleton.bin` | 2,0 KB | Tabla de esqueleto |
| `sam3d_mesh.json` | 325,0 B | Metadatos de malla |

## Arquitectura y entrenamiento

El modelo subyacente es SAM 3D Body de Meta, un sistema de reconstruccion 3D de cuerpo humano que combina un backbone DINOv3 con cabezas especificas para cuerpo y manos, un modulo de fusion y una capa de geometria basada en la topologia MHR (Meta Human Rig). La conversion agrupa todos estos componentes en un unico grafo TorchScript en fp32: el backbone, ambas manos, la fusion y la geometria MHR se ejecutan en una sola llamada. El autor indica que el trazado se realizo desde `model.ckpt` y `assets/mhr_model.pt` mediante `tools/torch/sam3d_full_jit.py`.

No se aporta informacion sobre el entrenamiento original (numero de tokens, composicion del dataset, RLHF/DPO ni innovaciones de atencion). Lo unico relevante en cuanto a proceso es que esta publicacion es puramente de inferencia: no hay reentrenamiento, fine-tuning ni poda. La verificacion reportada por el autor es que la diferencia maxima de vertices frente a la referencia en PyTorch es de 1,5e-5 m en fp32, con keypoints y camara dentro de 1e-3, y que el grafo batch-8 reproduce el batch-1 con un error de 7,7e-7 por elemento. Las tablas MHR se extrajeron con `tools/onnx/dump_mesh.py`.

## Capacidades

- Reconstruccion 3D de cuerpo humano a partir de imagenes, con geometria de malla MHR.
- Estimacion de pose de manos (el grafo completo incluye ambas manos; existe variante solo cuerpo).
- Estimacion de parametros de camara junto con keypoints y vertices.
- Procesamiento por lotes: el grafo `b8` reconstruye hasta ocho personas en una sola llamada.
- Flujo de video: el autor menciona que la referencia muestrea manos cada cuatro fotogramas y cuerpo en todos, con interpolacion de caracteristicas de mano desde un vecino; la variante `sam3d_body_b8_ts.pt` esta pensada para esos fotogramas.
- Ejecucion via LibTorch (no via ONNX Runtime).
- No dispone de generacion de texto, tool calling, agentes ni capacidades multilingues: es un modelo de vision 3D.

## Casos de uso

- Captura de movimiento en produccion de animacion: el grafo completo reconstruye cuerpo, manos y camara en una sola pasada, lo que permite generar esqueletos MHR directamente desde metraje y alimentar un pipeline de animacion sin pasar por PyTorch.
- Integracion en VeloMocap: los ficheros se colocan en `models/sam3d/` de una instalacion de VeloMocap y el runtime los carga con LibTorch; es el caso de uso principal declarado por el autor.
- Procesamiento por lotes de escenas multitudinarias: la variante `sam3d_full_b8_ts.pt` procesa hasta ocho personas por llamada, adecuada para planos con varios sujetos donde el coste por persona importa.
- Analisis de video con muestreo selectivo de manos: usar `sam3d_body_b8_ts.pt` en los fotogramas cuyas manos se interpolan desde un vecino reduce el coste frente a ejecutar el grafo completo en todos los fotogramas.
- Despliegue en entornos sin PyTorch completo: al ser TorchScript, se puede servir con LibTorch en C++ o en un runtime embebido, lo que simplifica el empaquetado frente a depender del codigo Python original.
- Investigacion en reconstruccion 3D: sirve como referencia reproducible para comparar implementaciones propias contra la salida de Meta, dado que el autor documenta la tolerancia numerica (1,5e-5 m en vertices).
- Renderizado de malla en herramientas propias: las tablas `sam3d_faces.bin`, `sam3d_keypoints.bin`, `sam3d_skeleton.bin` y `sam3d_mesh.json` permiten reconstruir la topologia MHR sin depender del repositorio upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta verificaciones de equivalencia numerica frente a la referencia en PyTorch:

| Metrica | Resultado declarado |
|---|---|
| Diferencia maxima de vertices (fp32) | 1,5e-5 m |
| Diferencia en keypoints y camara | dentro de 1e-3 |
| Reproducibilidad batch-8 vs batch-1 | 7,7e-7 por elemento |

No hay datos de latencia, throughput ni comparacion con otros modelos de captura de movimiento.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, los grafos pesan 3,1-3,3 GB en fp32, por lo que el peso de los parametros ronda esa cifra; el consumo real depende de las activaciones y del tamano de lote.
- El autor indica que VeloMocap prefiere `sam3d_full_b8_ts.pt` en tarjetas con 10 GB o mas y recurre a `sam3d_full_ts.pt` por debajo de ese umbral.
- GPU recomendadas: no disponibles de forma explicita; por el umbral de 10 GB, encajan tarjetas de gama alta de consumo (por ejemplo, RTX 3080/4080/4090 con 10-24 GB) y GPUs de datacenter (A100, H100).
- Cabe en GPU de consumo: si, segun el umbral de 10 GB indicado por el autor para la variante batch-8.
- Opciones de despliegue: LibTorch (via TorchScript). El autor senala que el export ONNX existe en el arbol de desarrollo pero no se usa en la release ni se publica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `velomocap-sam3d-torchscript` (esta ficha) | Conversion TorchScript de SAM 3D Body | no disponible | no aplica | SAM License | Hugging Face, 10,4 GB |
| `facebook/sam-3d-body-dinov3` | Modelo original de Meta | no disponible | no aplica | SAM License | Hugging Face (upstream) |
| Alternativas de captura de movimiento 3D | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es con el modelo upstream de Meta, del que esta publicacion es una conversion. No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier expectativa en ese sentido es erronea.
- Es una conversion, no un modelo nuevo: el autor declara que no se ha reentrenado, ajustado ni podado; los meritos de calidad corresponden al modelo original de Meta.
- Publicado por contribuidores de VeloMocap, no por los autores originales; el autor lo indica explicitamente y no ofrece garantia.
- Solo se ejecuta con LibTorch; el export ONNX no esta publicado y no forma parte de la release.
- Los pesos estan en fp32; no se documentan cuantizaciones ni versiones reducidas.
- La licencia SAM permite uso comercial, pero el texto de la licencia debe acompanar a los ficheros; es responsabilidad del usuario conservarlo y cumplir sus terminos.
- No hay datos de sesgos, alucinacion (no aplica en el sentido de texto) ni limitaciones de idioma; al ser un modelo de vision, los riesgos se refieren a precision de reconstruccion en condiciones de oclusion, iluminacion o resolucion no documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validacion externa.
- El pipeline no esta declarado en Hugging Face, por lo que no se puede cargar con `transformers` ni con herramientas estandar de inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YuanBaoSMadLab/velomocap-sam3d-torchscript
- Modelo upstream (Meta): https://huggingface.co/facebook/sam-3d-body-dinov3
- Repositorio de VeloMocap: https://github.com/YuanBaoSMadLab/velomocap
- Licencia SAM: https://huggingface.co/facebook/sam-3d-body-dinov3 (enlace de licencia indicado en la model card)
