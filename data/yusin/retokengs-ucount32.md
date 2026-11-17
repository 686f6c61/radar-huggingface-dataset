# Yusin/ReTokenGS-ucount32

## Resumen

ReTokenGS-ucount32 es un modelo feed-forward de reconstruccion 3D y sintesis de vistas noveles basado en gaussian splatting, desarrollado por el autor Yusin. No es un modelo de lenguaje: es una red neuronal que, a partir de 4 vistas de entrada con pose conocida a resolucion 256×256, predice un conjunto de gaussianas 3D que representan la escena y permiten renderizar vistas nuevas. El modelo se construye sobre LocusGS y TokenGS y se entrena con el conjunto de datos DL3DV-10K.

La innovacion principal es la regla de "nacimientos" (births) guiada por incertidumbre: una unica capa decodificadora con pesos compartidos se ejecuta como un bucle convergente, y en cada ronda cada token lee el gradiente de renderizado de sus propias gaussianas (G3R) y aplica un paso de gradiente latente con busqueda de linea. Los tokens cuya cabeza de incertidumbre predice mayor error se dividen, y el numero de divisiones por ronda es el propio error predicho. El bucle arranca con 256 tokens y crece hasta un maximo de 1024, con 32 gaussianas por token (de ahi "ucount32").

El modelo tiene 176.321.721 parametros y un repositorio de 0,7 GB. Su relevancia es experimental: en el benchmark oficial de DL3DV con 4 vistas queda por detras de las variantes `grad` y `dens` del mismo autor en calidad de reconstruccion, y su aportacion real es la regla de nacimiento dentro de un bucle que converge, no el rendimiento absoluto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Feed-forward con bucle recurrente de capa decodificadora compartida; tokens gaussianos con cabeza de incertidumbre para nacimientos (basada en LocusGS / TokenGS) |
| Parametros totales | 176.321.721 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada de 4 vistas con pose a 256×256, hasta 1024 tokens con 32 gaussianas por token |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, epoca 18 de 18) |

## Arquitectura y entrenamiento

La arquitectura es un modelo feed-forward de gaussian splatting con un decodificador recurrente de pesos compartidos. Cada ronda del bucle actualiza los tokens leyendo el gradiente de renderizado de sus propias gaussianas (G3R) y aplicando un paso de gradiente latente con busqueda de linea, de modo que el bucle converge hacia una representacion mejorada de la escena. La cabeza de incertidumbre aprendida predice el error de cada token; los tokens con mayor error predicho se dividen, y el numero de divisiones por ronda coincide con el error predicho. El numero de tokens crece desde 256 hasta un maximo de 1024, con 32 gaussianas por token.

El entrenamiento se realiza sobre DL3DV-10K y el checkpoint publicado corresponde a la epoca 18, la ultima del run. La evaluacion oficial usa 140 escenas, 4 vistas y 32 rondas a 256×256. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas de alineamiento tipo RLHF/DPO, que no aplican a este tipo de modelo. La innovacion tecnica destacable es la regla de nacimiento guiada por incertidumbre dentro de un bucle convergente, frente a esquemas de densificacion fijos.

## Capacidades

- Reconstruccion 3D feed-forward a partir de 4 vistas con pose conocida a 256×256.
- Sintesis de vistas noveles mediante renderizado de gaussianas 3D.
- Bucle recurrente convergente con actualizacion de tokens por gradiente de renderizado (G3R) y busqueda de linea.
- Crecimiento adaptativo de tokens (de 256 a 1024) mediante nacimientos guiados por una cabeza de incertidumbre.
- Representacion con 32 gaussianas por token.
- Variante de streaming disponible en `Yusin/ReTokenGS-stream`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso linguistico ni capacidades multilingues: no es un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales fuera de la reconstruccion 3D.

## Casos de uso

- Reconstruccion de escenas a partir de pocas vistas: con solo 4 imagenes con pose a 256×256, el modelo genera una representacion gaussiana de la escena, util para captura rapida en entornos controlados.
- Sintesis de vistas noveles para visualizacion: renderizar angulos no capturados de una escena a partir de las 4 vistas de entrada, por ejemplo en previsualizacion de productos o inmuebles.
- Investigacion en gaussian splatting feed-forward: el modelo sirve como banco de pruebas para estudiar reglas de nacimiento guiadas por incertidumbre y bucles recurrentes convergentes.
- Generacion de activos 3D para pipelines graficos: producir representaciones gaussianas que puedan integrarse en motores de renderizado compatibles con splatting.
- Evaluacion comparativa de metodos de densificacion: al coexistir con las variantes `grad`, `dens` y `stream`, permite medir el efecto de distintas reglas de crecimiento de tokens sobre PSNR, LPIPS y SSIM.
- Prototipado de reconstruccion multi-vista en entornos con recursos limitados: el checkpoint ocupa 0,7 GB y 176 M de parametros, lo que facilita su despliegue en estaciones de trabajo con una sola GPU.
- Base para experimentos de streaming: junto con `ReTokenGS-stream`, permite explorar reconstruccion incremental de escenas.

## Benchmarks y rendimiento

Benchmark oficial de DL3DV (140 escenas, 4 vistas, 256×256, 32 rondas):

| Modelo | PSNR | LPIPS | SSIM |
|---|---|---|---|
| ReTokenGS-grad | 24.733 | 0.2664 | 0.7916 |
| ReTokenGS-dens (4096 tokens) | 25.091 | 0.2442 | 0.8031 |
| ReTokenGS-stream | 22.856 | 0.3881 | 0.7108 |
| ReTokenGS-ucount32 | 22.859 | 0.3861 | 0.7126 |

En el ajuste estandar de 4 vistas, ReTokenGS-ucount32 queda por detras de `grad` y `dens`. Su PSNR (22.859) es practicamente identico al de `stream` (22.856), con LPIPS y SSIM ligeramente mejores (0.3861 frente a 0.3881 y 0.7126 frente a 0.7108).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el checkpoint ocupa 0,7 GB en safetensors y el modelo tiene 176 M de parametros, por lo que la huella de pesos es reducida, pero el coste de renderizado de gaussianas y del bucle de 32 rondas no esta cuantificado.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el reducido tamano del checkpoint sugiere que podria caber en GPU de consumo, pero no hay datos confirmados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo); el codigo, evaluacion y entrenamiento estan en el repositorio GitHub `Yusin2Chen/TokenGS-Loop`, rama `ucount32`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | PSNR (DL3DV) | LPIPS | SSIM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| ReTokenGS-ucount32 | 176.321.721 | 4 vistas, 256×256 | 22.859 | 0.3861 | 0.7126 | apache-2.0 | Hugging Face |
| ReTokenGS-grad | no disponible | 4 vistas, 256×256 | 24.733 | 0.2664 | 0.7916 | no disponible | Hugging Face |
| ReTokenGS-dens | no disponible (4096 tokens) | 4 vistas, 256×256 | 25.091 | 0.2442 | 0.8031 | no disponible | Hugging Face |
| ReTokenGS-stream | no disponible | 4 vistas, 256×256 | 22.856 | 0.3881 | 0.7108 | no disponible | Hugging Face |

Las tres alternativas son variantes del mismo autor y la misma base LocusGS / TokenGS, por lo que la comparacion es directa. No se dispone de datos de otros modelos externos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento inferior a las variantes `grad` y `dens` en el ajuste estandar de 4 vistas: 22.859 PSNR frente a 24.733 y 25.091 respectivamente.
- Entrada restringida a 4 vistas con pose conocida y resolucion 256×256; no se documenta comportamiento con otras configuraciones.
- Numero de tokens limitado a un maximo de 1024, lo que puede limitar la fidelidad en escenas complejas.
- Entrenado unicamente con DL3DV-10K; posible sesgo hacia las caracteristicas de ese dataset y riesgo de generalizacion limitada a otros dominios.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento linguistico.
- No se han publicado datos sobre sesgos, tasas de alucinacion geometrica ni robustez ante vistas de entrada ruidosas o mal posicionadas.
- Licencia Apache-2.0 derivada de LocusGS / TokenGS; conviene revisar las condiciones de las obras de las que deriva antes de uso comercial.
- Checkpoint correspondiente a la ultima epoca (18) de un unico run; sin informacion sobre estabilidad entre semillas.
- Sin datos publicados de latencia, throughput ni requisitos de VRAM, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yusin/ReTokenGS-ucount32
- Variante streaming: https://huggingface.co/Yusin/ReTokenGS-stream
- Variante grad: https://huggingface.co/Yusin/ReTokenGS-grad
- Variante dens: https://huggingface.co/Yusin/ReTokenGS-dens
- Codigo, evaluacion y entrenamiento (rama ucount32): https://github.com/Yusin2Chen/TokenGS-Loop/tree/ucount32
- Repositorio LocusGS: https://github.com/leo-frank/LocusGS
- Repositorio TokenGS: https://github.com/nv-tlabs/TokenGS
- Dataset DL3DV-10K: https://huggingface.co/datasets/DL3DV/DL3DV-10K
