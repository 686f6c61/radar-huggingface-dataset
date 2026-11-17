# Yusin/ReTokenGS-stream

## Resumen

ReTokenGS-stream es un modelo de reconstruccion 3D y sintesis de vistas novedosas (novel view synthesis) basado en Gaussian Splatting, desarrollado por el autor Yusin. No es un modelo de lenguaje: se trata de una red feed-forward que, a partir de un conjunto de vistas con pose conocida a resolucion 256x256, genera un conjunto de Gaussianos 3D que representan la escena y permiten renderizarla desde angulos nuevos. El modelo se construye sobre LocusGS y TokenGS y su aportacion principal es un mecanismo de streaming que permite incorporar vistas de entrada en cualquier ronda de un bucle iterativo de refinamiento.

La arquitectura emplea un decoder de una sola capa compartido en peso que se ejecuta en bucle. En cada ronda, cada token lee el gradiente de renderizado de sus propios Gaussianos (G3R) y aplica un paso de gradiente latente con busqueda lineal. El numero de tokens crece de forma adaptativa mediante "births" guiados por una cabeza de incertidumbre: los tokens con mayor error predicho se dividen, y el numero de divisiones por ronda es el propio error predicho. El bucle arranca con 256 tokens y crece hasta un maximo de 1024, con 32 Gaussianos por token.

El modelo tiene 176.321.721 parametros y un repositorio de 0,7 GB en formato safetensors (epoch 29 del fine-tune de streaming). Es relevante por su enfoque de streaming en reconstruccion 3D feed-forward: las vistas pueden llegar en cualquier momento y el modelo sigue iterando sobre todas las vistas vistas hasta el momento, lo que lo hace adecuado para escenarios incrementales. En el benchmark oficial DL3DV de 4 vistas queda por detras de sus variantes grad y dens, pero su contribucion es el mecanismo de nacimiento y streaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer feed-forward con decoder de una capa compartido en bucle (recurrent Gaussian tokens), basado en LocusGS / TokenGS |
| Parametros totales | 176.321.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (opera con 4-6 vistas de entrada a 256x256; hasta 1024 tokens con 32 Gaussianos por token) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ReTokenGS-stream es una red feed-forward para reconstruccion 3D basada en Gaussian Splatting. Su nucleo es un decoder de una unica capa compartido en peso que se ejecuta de forma iterativa (loop). En cada ronda, cada token lee el gradiente de renderizado de sus Gaussianos asociados (G3R) y realiza un paso de gradiente latente con busqueda lineal. El conjunto de tokens se inicializa en 256 y puede crecer hasta 1024, con 32 Gaussianos por token, lo que da un maximo de 32.768 Gaussianos por escena.

La innovacion principal es el mecanismo de nacimiento ("births") guiado por incertidumbre: una cabeza de incertidumbre aprendida predice el error de cada token, y los tokens con mayor error predicho se dividen. El numero de divisiones por ronda equivale al error predicho. Ademas, el modelo soporta streaming: las vistas de entrada pueden incorporarse en cualquier ronda, se codifican al llegar y todos los tokens siguen iterando sobre todas las vistas vistas hasta el momento. El modelo se entrena sobre el dataset DL3DV/DL3DV-10K con vistas con pose a 256x256. El checkpoint publicado corresponde a la epoch 29 del fine-tune de streaming. No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF/DPO (no aplicable en este dominio).

## Capacidades

- Reconstruccion 3D feed-forward de escenas a partir de vistas con pose conocida.
- Sintesis de vistas novedosas (novel view synthesis) mediante renderizado de Gaussianos 3D.
- Streaming de vistas de entrada: admite la incorporacion de nuevas vistas en cualquier ronda del bucle iterativo.
- Crecimiento adaptativo de tokens mediante nacimientos guiados por una cabeza de incertidumbre.
- Refinamiento iterativo mediante pasos de gradiente latente sobre el gradiente de renderizado (G3R).
- Trabaja con resolucion de 256x256 y configuraciones de 4 a 6 vistas.
- No soporta tool calling, agentes, capacidades multilingues ni generacion de texto (no es un modelo de lenguaje).

## Casos de uso

- Reconstruccion 3D incremental en robotica: el modelo puede procesar vistas capturadas por una camara en movimiento e incorporarlas a medida que llegan, manteniendo una representacion 3D actualizada de la escena gracias a su mecanismo de streaming.
- Captura de escenas con drones o vehiculos: las vistas se incorporan progresivamente durante el vuelo o recorrido, y el modelo refina la representacion 3D con cada nueva vista sin necesidad de reprocesar todo el conjunto desde cero.
- Prototipado de pipelines de novel view synthesis: util para evaluar estrategias de incorporacion de vistas y reglas de nacimiento de tokens en entornos de investigacion, dado que el codigo de entrenamiento y evaluacion esta disponible en GitHub.
- Generacion de activos 3D para realidad aumentada o virtual: a partir de un conjunto reducido de fotos con pose, se obtiene una representacion de Gaussianos renderizable desde angulos nuevos a 256x256.
- Investigacion en representaciones 3D adaptativas: el mecanismo de births guiado por incertidumbre sirve como banco de pruebas para estudiar asignacion dinamica de capacidad en modelos 3D.
- Evaluacion comparativa de metodos de Gaussian Splatting feed-forward sobre DL3DV: el modelo y sus variantes (grad, dens) permiten reproducir los resultados del benchmark oficial con los comandos publicados.

## Benchmarks y rendimiento

Benchmark oficial DL3DV (140 escenas, 4 vistas, 256x256, 32 rondas):

| Modelo | PSNR | LPIPS | SSIM |
|---|---|---|---|
| ReTokenGS-grad | 24.733 | 0.2664 | 0.7916 |
| ReTokenGS-dens (4096 tokens) | 25.091 | 0.2442 | 0.8031 |
| ReTokenGS-stream | 22.856 | 0.3881 | 0.7108 |

Streaming (mismas 140 escenas, split de 6 vistas, PSNR):

| Configuracion | 16 rondas | 24 rondas | 32 rondas |
|---|---|---|---|
| 6 vistas desde la ronda 1 | 23.421 | no disponible | 24.074 |
| Solo vistas 1-4 | no disponible | 22.817 | no disponible |
| Vistas 1-4, vistas 5-6 se unen en la ronda 17 | no disponible | 23.289 | 23.675 |

Las vistas tardias aportan +0,47 dB sobre la referencia de vistas 1-4 con el mismo numero de rondas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El tamano del repositorio es de 0,7 GB en safetensors, lo que da una cota inferior del peso de los parametros (176,3 M de parametros).
- GPU recomendadas: no disponible. El modelo opera a 256x256 con hasta 1024 tokens y 32 Gaussianos por token, lo que sugiere requisitos moderados, pero no se han publicado mediciones.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: el codigo de evaluacion y entrenamiento esta en GitHub (rama `stream` del repositorio `Yusin2Chen/TokenGS-Loop`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este dominio).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | PSNR DL3DV (4 vistas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReTokenGS-stream | 176,3 M | Bucle recurrente con streaming de vistas | 22.856 | apache-2.0 | Hugging Face + GitHub |
| ReTokenGS-grad | no disponible | Bucle recurrente con gradiente | 24.733 | apache-2.0 | Hugging Face |
| ReTokenGS-dens (4096 tokens) | no disponible | Bucle recurrente con 4096 tokens | 25.091 | apache-2.0 | Hugging Face |
| LocusGS / TokenGS (base) | no disponible | Feed-forward con Gaussian tokens | no disponible | no disponible | GitHub |

## Limitaciones y advertencias

- En el ajuste estandar de 4 vistas el modelo queda por detras de sus variantes grad y dens en PSNR, LPIPS y SSIM; su ventaja es el mecanismo de streaming, no la calidad absoluta en ese regimen.
- Resolucion de trabajo limitada a 256x256; no se documenta soporte para resoluciones mayores.
- Requiere vistas con pose conocida; no se describe un modulo de estimacion de pose integrado.
- Numero maximo de tokens fijado en 1024, lo que limita la capacidad de representacion en escenas complejas.
- No se han publicado datos sobre sesgos, riesgo de alucinacion en el sentido de artefactos de renderizado, ni evaluaciones fuera de DL3DV.
- Licencia Apache-2.0 derivada de LocusGS / TokenGS; conviene revisar las condiciones de los proyectos upstream para uso comercial.
- Modelo de investigacion con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion.
- No es un modelo de lenguaje: no soporta texto, tool calling ni agentes.

## Enlaces

- Hugging Face: https://huggingface.co/Yusin/ReTokenGS-stream
- Variante grad: https://huggingface.co/Yusin/ReTokenGS-grad
- Variante dens: https://huggingface.co/Yusin/ReTokenGS-dens
- Codigo (rama stream): https://github.com/Yusin2Chen/TokenGS-Loop/tree/stream
- LocusGS: https://github.com/leo-frank/LocusGS
- TokenGS: https://github.com/nv-tlabs/TokenGS
- Dataset DL3DV-10K: https://huggingface.co/datasets/DL3DV/DL3DV-10K
