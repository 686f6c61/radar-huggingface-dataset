# tls8012/adcd_tuned

## Resumen

`adcd_tuned` es un paquete de artefactos publicado por el usuario `tls8012` en Hugging Face para una tarea muy concreta: la deteccion de manipulacion (tampering) en imagenes de recibos o tickets. No es un modelo de lenguaje ni un transformer generativo, sino un conjunto de pesos y ficheros de calibracion que se integran en un pipeline de forensia documental denominado "ruta A" por el autor. El nucleo del sistema es ADCD-Net, una red de deteccion de manipulacion a nivel de pixel cuyos pesos publicos se reutilizan sin reentrenamiento.

La contribucion propia del repositorio es doble. Por un lado, un clasificador de mapas de calor (`heatmap_clf.json`) que toma 21 caracteristicas extraidas del mapa de calor por pixel generado por ADCD-Net y las combina mediante estandarizacion y regresion logistica para producir una puntuacion unica entre 0 y 1 por imagen. Por otro, un fichero de calibracion (`route_a/calibration.json`) que define transformaciones por senal y umbrales por grupo de inspeccion ajustados a un presupuesto de falsos positivos del 10 %.

El interes del paquete es acotado pero practico: ofrece un punto de partida reproducible para construir un verificador de recibos con umbrales calibrados y metricas declaradas. El repositorio ocupa 0,5 GB y esta etiquetado como `document-forensics`, `tamper-detection` y `receipts`, con licencia MIT y soporte declarado unicamente para coreano (`ko`). No se especifica pipeline, no tiene descargas ni likes, y fue creado y actualizado el 24 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ADCD-Net (red de deteccion de manipulacion a nivel de pixel) + clasificador logistico sobre caracteristicas de mapa de calor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en `.pth` y `.pkl`, sin versiones GGUF/ONNX declaradas) |
| Idiomas soportados | coreano (`ko`) |
| Licencia | MIT (ADCD-Net); DocRes segun su repositorio original; clasificador y calibracion del autor del repo |
| Formato de pesos | PyTorch (`ADCDNet.pth`), pickle (`docres.pkl`), JSON (`heatmap_clf.json`, `route_a/calibration.json`), PyTorch (`calib_head_shift.pt`, `calib_head_head.pt`) |

## Arquitectura y entrenamiento

El componente principal, ADCD-Net, es una red de deteccion de manipulacion de imagenes que produce mapas de calor por pixel. En este repositorio se emplean sus pesos publicos originales (autor KahimWong) sin reentrenamiento, junto con el checkpoint del backbone DocRes (`docres.pkl`) que ADCD-Net utiliza. Sobre esa base, el autor del repositorio entrena unicamente el clasificador de mapas de calor: extrae 21 caracteristicas del mapa de calor y ajusta una regresion logistica con estandarizacion previa, segun la formula `p = sigmoid(intercept + coef · (x − mean) / scale)`. Los nombres de las caracteristicas se listan en el campo `features` del JSON.

La segunda pieza entrenada es la calibracion de la ruta A: transformaciones por senal y umbrales por grupo de inspeccion fijados para un presupuesto de falsos positivos del 10 %. El repositorio incluye ademas dos ficheros experimentales (`calib_head_shift.pt` y `calib_head_head.pt`) que reajustan la ultima capa bajando las puntuaciones de forma global; el autor indica explicitamente que no se usan en el pipeline. No se documentan en la model card el volumen de datos de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO (no aplicables a esta tarea).

## Capacidades

- Deteccion de manipulacion en imagenes de recibos a nivel de pixel mediante ADCD-Net.
- Conversion del mapa de calor en una puntuacion unica por imagen (0 a 1) mediante el clasificador logistico.
- Deteccion de falsificaciones por sustitucion de digitos en la fotografia (el autor reporta AUC 0,92 en un experimento de control con relleno por clonacion).
- Deteccion de falsificaciones digitales combinando ADCD, duplicacion de caracteres y comprobaciones de consistencia (ruta A completa).
- Calibracion con presupuesto de falsos positivos configurable (10 % en la configuracion publicada).
- Verificacion de autenticidad de contenido generado o editado por IA apoyandose en metadatos C2PA.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un componente de vision para un pipeline de forensia.

## Casos de uso

- Verificacion de recibos en procesos de reembolso: el pipeline ruta A puede puntuar cada imagen y aplicar el umbral calibrado para derivar a revision manual los casos sospechosos, reduciendo el volumen de inspeccion humana.
- Auditoria de gastos corporativos: integrado en un flujo de aprobacion de facturas, el clasificador de mapas de calor aporta una senal objetiva ante recibos fotografiados con digitos alterados.
- Deteccion de fraude en programas de recompensas o cashback: la ruta A combina senales de manipulacion digital y de duplicacion de caracteres para filtrar envios antes del pago.
- Triaje en plataformas de gestion documental: el score 0-1 por imagen permite ordenar la cola de revision por riesgo, priorizando los recibos con mayor probabilidad de manipulacion.
- Control de calidad en digitalizacion de tickets: aplicar ADCD-Net de forma masiva para detectar ediciones posteriores a la captura antes de archivar el documento.
- Verificacion de contenido sospechoso de ser generado por IA: cuando el recibo incluye metadatos C2PA, el sistema puede apoyarse en esa procedencia para complementar la deteccion visual.
- Investigacion en forensia documental: el repositorio sirve como base reproducible para comparar tecnicas de deteccion y calibrar umbrales con presupuesto de falsos positivos controlado.

## Benchmarks y rendimiento

| Evaluacion | Metrica | Valor |
|---|---|---|
| Clasificador de mapas de calor (validacion cruzada de 5 pliegues a nivel de recibo) | AUC | 0,874 |
| Clasificador de mapas de calor, umbral 0,5 | Falsos positivos | 17 % |
| Clasificador de mapas de calor, umbral 0,5 | Deteccion | 79 % |
| Clasificador frente a linea base justa | Mejora de exactitud | +1,7 pp |
| Experimento de control (sustitucion de digitos, relleno por clonacion) | AUC | 0,92 |
| Ruta A completa (ADCD + duplicacion de caracteres + consistencia, presupuesto FP 10 %) | Falsos positivos en normales | 8 % |
| Ruta A completa | Deteccion de falsificacion digital | 96 % |
| Recibos generados/editados por IA tras recompresion JPEG | AUC | 0,65-0,74 |

El autor advierte que las cifras se midieron sobre datos de la misma fuente que el entrenamiento del clasificador y que en datos nuevos pueden ser inferiores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El tamano del repositorio (0,5 GB) sugiere que los pesos caben holgadamente en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible. Al ser una red de vision para inferencia por imagen, cualquier GPU con suficiente memoria para ADCD-Net y DocRes deberia servir; el autor no especifica modelos.
- Compatibilidad con GPU de consumo: probable por el tamano del repo, pero no confirmada en la model card.
- Opciones de despliegue: el autor indica que el codigo de estructura del modelo esta en el repositorio original de ADCD-Net y que los ficheros se descargan con `huggingface_hub` o mediante `scripts/model_hub.py` del proyecto. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la informacion disponible. El autor solo compara el clasificador con una "linea base justa" sin nombrarla, y reporta una mejora de +1,7 pp en exactitud. No se dispone de datos de alternativas como TruFor, Noiseprint u otros detectores de manipulacion de imagenes en esta ficha.

## Limitaciones y advertencias

- Las metricas declaradas se midieron sobre la misma fuente de datos usada para entrenar el clasificador; el autor advierte que en datos nuevos pueden ser peores.
- La mejora del clasificador frente a una linea base justa es pequena (+1,7 pp), aunque el efecto es claro en falsificaciones por sustitucion de digitos.
- Los recibos generados o editados por IA se detectan solo debilmente tras recompresion JPEG (AUC 0,65-0,74); para esos casos el sistema depende de la informacion de procedencia C2PA.
- El soporte de idioma declarado es unicamente coreano (`ko`), lo que limita su uso directo en recibos en otros idiomas.
- Los ficheros `calib_head_shift.pt` y `calib_head_head.pt` son experimentales y no deben usarse en produccion segun el propio autor.
- La licencia MIT cubre ADCD-Net (copyright de KahimWong); el checkpoint DocRes se rige por la licencia de su repositorio original, que debe verificarse antes de uso comercial.
- No se documentan sesgos especificos, pero al ser un detector entrenado sobre una unica fuente de datos, es esperable una degradacion ante dominios distintos (otro tipo de recibos, otras camaras, otras condiciones de iluminacion).
- No hay informacion sobre calibracion de probabilidades fuera del umbral publicado ni sobre robustez ante ataques adversariales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tls8012/adcd_tuned
- Repositorio original de ADCD-Net (autor KahimWong): no disponible en la informacion proporcionada
- Repositorio de DocRes: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
