# udbbdh/toposet-rig-vae-z32-skel

## Resumen

TopoSet rig VAE (z32), skeleton-mode fine-tune es un modelo generativo latente para datos de rigging 3D desarrollado por el usuario udbbdh. Se trata de un fine-tune del VAE de rigging de la base de codigo TopoSet, un modelo de 246 millones de parametros con un espacio latente de 32 dimensiones por token que codifica y reconstruye esqueletos y mallas 3D. La innovacion principal de esta version es que puede procesar un esqueleto sin su malla asociada, es decir, articulaciones mas una nube de puntos de la superficie, sin necesidad de vertices, caras ni pesos de skinning.

El modelo resuelve un problema concreto en pipelines de rigging automatico: hasta ahora el VAE requeria la malla completa para inferir la jerarquia de huesos, lo que limitaba su uso en escenarios donde solo se dispone de una nube de puntos o de un esqueleto parcial. Con este fine-tune, el modelo acepta entradas de rig completo, solo malla o solo esqueleto, manteniendo el rendimiento en las dos primeras modalidades.

Es relevante ahora porque habilita el rigging a partir de capturas de movimiento, escaneos de puntos o datos de sensores sin malla, y porque demuestra que un VAE de espacio latente puede aprender una representacion conjunta de geometria y topologia de esqueleto de forma robusta. El repositorio ocupa 1.0 GB y contiene los pesos en formato PyTorch (`state_dict` en fp32) junto con la configuracion del constructor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con rama espaciotemporal (`RigSpacetimeBranchVAE`) |
| Parametros totales | 246 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (espacio latente de 32 dimensiones por token) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no aplica (modelo 3D, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pth`, 460 tensores, fp32) |

## Arquitectura y entrenamiento

El modelo es un VAE (`RigSpacetimeBranchVAE`) con una rama espaciotemporal que opera sobre tokens de rig, cada uno con un latente de 32 dimensiones. El checkpoint publicado es la media exponencial (EMA, factor 0.999) de los pesos en el paso 120.000. Se inicializo a partir del VAE de rigging z32 en el paso 150.000 y se entreno durante 120.000 pasos adicionales con una tasa de aprendizaje de 1,5e-5 decayendo hasta 5e-6.

La composicion del entrenamiento es clave para la nueva capacidad: cada muestra riggeada se usa como rig completo mas malla (45 %), solo malla (10 %) o solo esqueleto (45 %). La mitad de las muestras de solo esqueleto se re-posan aplicando rotaciones de hasta 60 grados al 80 % de las articulaciones con linear-blend skinning, lo que fuerza al modelo a aprender una representacion invariante a la pose. Ademas se mezclan mallas low-poly sin riggear para preservar la capacidad de reconstruccion de malla. No se menciona uso de RLHF ni DPO, lo cual es esperable en un modelo de reconstruccion 3D.

## Capacidades

- Codificacion y reconstruccion de esqueletos completos a partir de rig mas malla, con un error medio de articulacion de 0,0019 (normalizado a la caja envolvente de la malla).
- Codificacion de esqueletos a partir de solo esqueleto (articulaciones mas nube de puntos de superficie), sin malla, con error de articulacion de 0,0052.
- Robustez a poses: con esqueletos re-posados, el error de articulacion se mantiene en 0,0058.
- Prediccion de jerarquia de huesos: precision de padre de 0,970 en rig completo y 0,885 en solo esqueleto; precision de raiz de 0,985 y 0,830 respectivamente.
- Reconstruccion de malla en entradas de solo malla, preservada mediante la mezcla de mallas sin riggear durante el entrenamiento.
- Inferencia de la raiz del esqueleto: seleccionando como raiz la articulacion cuyo arbol tiene mayor puntuacion total de hueso, la precision de raiz sube a 0,97 sin reentrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es un modelo 3D puro.

## Casos de uso

- Rigging automatico a partir de capturas de movimiento: dado un conjunto de posiciones de articulaciones obtenidas de un sistema de mocap sin malla asociada, el modelo infiere la jerarquia de huesos y reconstruye un esqueleto coherente, gracias a su entrenamiento con esqueletos re-posados.
- Reconstruccion de esqueletos desde escaneos de puntos: en pipelines de digitalizacion 3D donde solo se dispone de una nube de puntos de superficie, el modelo puede generar un esqueleto articulado sin necesidad de una malla cerrada, usando la modalidad de solo esqueleto.
- Preprocesamiento para animacion en produccion: integrado en un pipeline de personajes, el modelo convierte mallas low-poly sin riggear en esqueletos con jerarquia predicha, reduciendo el trabajo manual de rigging en activos secundarios.
- Limpieza y reparacion de rigs: dado un rig completo con posibles errores, el modelo reconstruye la jerarquia y las posiciones de articulaciones, sirviendo como paso de validacion o correccion en herramientas de DCC.
- Generacion de variantes de esqueleto para simulacion: a partir de una malla y un esqueleto base, el VAE permite muestrear en el espacio latente de 32 dimensiones para producir variantes de esqueleto con la misma topologia, utiles en entrenamiento de politicas de control motor.
- Investigacion en representaciones latentes 3D: el modelo sirve como encoder para experimentos que requieran un espacio latente compacto de esqueletos, por ejemplo para aprendizaje de poses o transferencia de rig entre personajes.
- Dataset augmentation para aprendizaje de rigging: el modelo puede generar pares esqueleto-malla sinteticos con poses variadas (rotaciones de hasta 60 grados) para aumentar datos de entrenamiento de otros modelos.

## Benchmarks y rendimiento

Resultados de reconstruccion sobre 200 mallas de validacion, usando la media posterior. El error de articulacion es la distancia euclidea media con el lado mas largo de la caja envolvente de la malla normalizado a 1.

| Entrada | Error de articulacion | Precision de padre | Precision de raiz | Arbol completo exacto |
|---|---|---|---|---|
| Rig completo + malla | 0,0019 | 0,970 | 0,985 | 0,815 |
| Solo esqueleto | 0,0052 | 0,885 | 0,830 | 0,595 |
| Solo esqueleto, re-posado | 0,0058 | 0,896 | 0,885 | 0,595 |

Antes de este fine-tune, el error de articulacion en solo esqueleto era de 0,0346, lo que supone una mejora de aproximadamente 6,7 veces. Con articulaciones sin peso de skinning eliminadas del ground truth, la precision de raiz en solo esqueleto sube a 0,905, y seleccionando la raiz por mayor puntuacion total de hueso alcanza 0,97 sin reentrenamiento. No se han publicado resultados comparativos con otros modelos de rigging en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 246 M de parametros en fp32, los pesos ocupan aproximadamente 1 GB. Con activaciones y overhead de inferencia, se estima un uso de 2-4 GB de VRAM, aunque no se proporcionan mediciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en fp32; una RTX 3060, RTX 4060 o superior cubre el caso consumer. Para procesamiento por lotes de mallas grandes se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM.
- Opciones de despliegue: al ser un `state_dict` de PyTorch con constructor en YAML, el despliegue requiere el codigo base de TopoSet y PyTorch. No hay soporte conocido para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de rigging 3D con VAE en la documentacion proporcionada. El modelo se presenta como un fine-tune del VAE de rigging z32 de la base de codigo TopoSet, pero no se ofrecen datos de otros modelos de la misma categoria para establecer una comparativa cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TopoSet rig VAE z32 skeleton-mode | 246 M | no disponible | no disponible | Hugging Face (udbbdh) |
| VAE z32 original (paso 150k) | 246 M | no disponible | no disponible | Referenciado en la model card, no enlazado |
| Alternativas de rigging 3D | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia no esta especificada en la model card ni en los metadatos de Hugging Face, por lo que no se puede garantizar el uso comercial sin consultar al autor.
- El modelo requiere el codigo base de TopoSet (`RigSpacetimeBranchVAE`) para instanciar la arquitectura; no es autocontenido.
- Los pesos se publican en fp32 y no hay versiones cuantizadas, lo que limita el despliegue en entornos con restricciones de memoria muy estrictas.
- La precision de arbol completo exacto en solo esqueleto es de 0,595, lo que indica que en aproximadamente el 40 % de los casos la jerarquia reconstruida no es exacta.
- La mayoria de los errores restantes provienen de articulaciones coincidentes, cuya relacion padre-hijo no puede determinarse solo a partir de la geometria.
- La precision de raiz en solo esqueleto es de 0,830 por defecto, lo que puede requerir heuristicas adicionales (como la seleccion por puntuacion de hueso) en produccion.
- No hay datos sobre sesgos, ya que el modelo opera sobre geometria 3D y no sobre texto o imagenes; sin embargo, el rendimiento puede degradarse en esqueletos con topologias atipicas no representadas en el entrenamiento.
- El modelo no es un modelo de lenguaje ni soporta tareas de texto, codigo o razonamiento; cualquier uso en esos dominios no es aplicable.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; se recomienda verificar el checksum sha256 antes de usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udbbdh/toposet-rig-vae-z32-skel
- Checkpoint directo: `rig_vae_ema_step_120000.pth` (sha256 `b0865c8075c00855bf297956d9598b3b1bae6f8f922f5e701f31ac1c945f97de`)
- Configuracion: `model_config.yaml` en el mismo repositorio
- Codigo base TopoSet: no disponible como enlace en la informacion proporcionada
- Paper, blog o demo: no disponibles en la informacion proporcionada
