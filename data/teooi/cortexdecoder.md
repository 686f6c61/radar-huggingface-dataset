# teooi/cortexdecoder

## Resumen

CortexDecoder es un conjunto de pesos "puente" (bridge weights) para la reconstruccion de imagenes a partir de actividad cerebral fMRI, desarrollado por Teo Imoto-Tar, Maxwell Fung y Arnav Gurha (repositorio `teooi`). El modelo no es un LLM ni un generador de texto: es un componente de un pipeline de decodificacion visual que traduce representaciones de la corteza visual, extraidas de flatmaps corticales, en caracteristicas de imagen que despues se invierten a pixeles mediante modelos generativos. Resuelve el problema de la decodificacion fMRI-a-imagen, un area clasica de la neurociencia computacional y de las interfaces cerebro-computador no invasivas.

La arquitectura se apoya en un encoder congelado, CortexMAE, que convierte parches de flatmap de la corteza visual en 200 "brain tokens" de dimension 768. Sobre esos tokens actuan dos puentes de atencion cruzada: uno de bajo nivel que proyecta hacia 7190 tokens VGG16-BN de dimension 512, y otro semantico que proyecta hacia 256 tokens de OpenCLIP ViT-bigG/14 de dimension 1664. Los pesos publicados en este repositorio corresponden unicamente a esos dos puentes (43,7 M y 39,3 M de parametros), no al encoder ni a los modelos generativos de inversion.

El modelo es relevante porque acompana a una publicacion en bioRxiv (2026) y porque libera pesos, configuracion y checkpoints de entrenamiento bajo licencia MIT, algo poco habitual en decodificacion cerebral. Esta entrenado especificamente sobre el sujeto 1 del Natural Scenes Dataset (NSD), por lo que su ambito de aplicacion es acotado y experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder CortexMAE congelado + dos puentes de atencion cruzada (low-level y semantico) |
| Parametros totales | 83,0 M (43,7 M `vgg_bridge` + 39,3 M `clip_bridge`) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 200 brain tokens de dim. 768) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | safetensors (`vgg_bridge.safetensors`, `clip_bridge.safetensors`) y checkpoints originales con estado del optimizador |
| Tamano del repositorio | 1,3 GB |
| Entrada | 200 brain tokens de dimension 768 (parches de flatmap de corteza visual) |
| Salida puente low-level | 7190 tokens VGG16-BN de dimension 512 |
| Salida puente semantico | 256 tokens OpenCLIP ViT-bigG/14 de dimension 1664 |
| Dataset de entrenamiento | NSD (Natural Scenes Dataset), sujeto 1 |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

El pipeline combina tres piezas. Primero, un encoder CortexMAE congelado procesa parches de flatmaps de la corteza visual (mostrando unicamente los parches de corteza visual) y produce 200 brain tokens de dimension 768 mediante el script `code/v2/scripts/generate_roi_tokens.py`. Segundo, dos cabezas de atencion cruzada independientes, implementadas como `FlatmapSingleHeadBridge`, mapean esos tokens a espacios de caracteristicas de imagen preentrenados: una cabeza de bajo nivel hacia tokens VGG16-BN (7190 tokens de dim. 512) y otra semantica hacia tokens OpenCLIP ViT-bigG/14 (256 tokens de dim. 1664). Tercero, esos tokens se invierten a imagen: la rama VGG mediante Deep Image Prior y la rama CLIP como condicionamiento de SDXL-unCLIP.

El entrenamiento se realizo sobre el sujeto 1 del Natural Scenes Dataset, un benchmark estandar de decodificacion fMRI con imagenes naturales. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF/DPO (no aplicables a este tipo de modelo). Los checkpoints publicados en `checkpoints/` conservan el estado del optimizador. La innovacion principal es el uso de flatmaps corticales como representacion de entrada, en lugar de voxels en volumen, lo que facilita el alineamiento entre sujetos y la visualizacion de resultados sobre la superficie cortical.

## Capacidades

- Decodificacion fMRI-a-imagen: reconstruye imagenes percibidas a partir de actividad de la corteza visual.
- Generacion de tokens de caracteristicas visuales de bajo nivel (VGG16-BN) para reconstruccion guiada por Deep Image Prior.
- Generacion de tokens semanticos (OpenCLIP ViT-bigG/14) para condicionamiento de SDXL-unCLIP.
- Trabajo sobre flatmaps corticales, lo que permite mapear predicciones sobre la superficie de la corteza.
- Entrenado para un sujeto especifico (NSD sujeto 1) con imagenes naturales.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo "thinking", vision general, audio ni otras capacidades multimodales fuera del pipeline descrito.

## Casos de uso

- Investigacion en neurociencia visual: reproducir y extender los resultados del paper evaluando la fidelidad de reconstruccion sobre el sujeto 1 del NSD con las metricas publicadas (PixCorr, SSIM, Alex(2), Alex(5), Incep, CLIP, Eff, SwAV).
- Estudios de alineamiento corteza-espacio latente: usar los dos puentes para comparar que regiones de la corteza contribuyen a caracteristicas de bajo nivel (VGG) frente a semanticas (CLIP), analizando los mapas de atencion cruzada.
- Desarrollo de interfaces cerebro-computador no invasivas: integrar el bridge en pipelines de decodificacion visual para prototipos de comunicacion asistida basada en fMRI.
- Benchmarking de metodos de reconstruccion: emplear los pesos como linea base reproducible (MIT) para comparar nuevas tecnicas de inversion (Deep Image Prior, SDXL-unCLIP u otras) manteniendo fijo el decodificador.
- Docencia y divulgacion: el formato de flatmaps y la separacion en dos ramas facilitan explicar visualmente el flujo fMRI -> tokens -> imagen en cursos de neurociencia computacional.
- Extension a nuevos sujetos: reentrenar los puentes (83 M de parametros en total) sobre otros sujetos del NSD reutilizando el encoder CortexMAE congelado, lo que reduce el coste computacional frente a entrenar el pipeline completo.

## Benchmarks y rendimiento

Resultados publicados en la model card para NSD sujeto 1, 998 imagenes de test, una muestra de difusion por imagen:

| Metrica | Valor |
|---|---|
| PixCorr | 0,366 |
| SSIM | 0,413 |
| Alex(2) | 98,1 % |
| Alex(5) | 99,1 % |
| Incep | 94,9 % |
| CLIP | 93,5 % |
| Eff | 0,628 |
| SwAV | 0,360 |

No se han publicado en la informacion disponible resultados comparativos frente a otros modelos de decodificacion fMRI-a-imagen.

## Requisitos de hardware

- VRAM estimada para los puentes: inferior a 1 GB en fp32 (83 M de parametros), por lo que caben en cualquier GPU consumer.
- El coste real esta en el pipeline completo: el encoder CortexMAE, OpenCLIP ViT-bigG/14 (aproximadamente 1,8 B de parametros en su version completa) y SDXL-unCLIP, que requieren GPU con al menos 16-24 GB de VRAM para inferencia comoda.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para procesar lotes de imagenes y ejecutar difusion con mayor throughput.
- Cabe en GPU consumer para los puentes; el pipeline completo de inversion a imagen es viable en RTX 3090/4090 con cuantizacion o descarga por etapas.
- Opciones de despliegue: PyTorch nativo con `safetensors` y `huggingface_hub`; el codigo de referencia esta en el repositorio GitHub `teooi/CortexDecoder` (rama `code/v2`). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos sobre modelos comparables de decodificacion fMRI-a-imagen (por ejemplo, variantes de MindEye, Takagi y Nishimoto u otros metodos del NSD) con los que establecer una comparacion de parametros, contexto, rendimiento y licencia. Los benchmarks publicados en la model card no incluyen una tabla comparativa frente a alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| CortexDecoder (este) | 83,0 M (puentes) | no aplica | MIT | Pesos en Hugging Face |
| Alternativas fMRI-a-imagen | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente sobre el sujeto 1 del NSD: no generaliza a otros sujetos sin reentrenamiento de los puentes.
- Dominio restringido a imagenes naturales del NSD; el rendimiento fuera de esa distribucion no esta documentado.
- Los pesos publicados son solo los puentes; requieren el encoder CortexMAE, el codigo del repositorio GitHub y modelos externos (VGG16-BN, OpenCLIP ViT-bigG/14, SDXL-unCLIP, Deep Image Prior) para producir imagenes.
- Riesgo de sobreinterpretacion: las metricas de bajo nivel (Alex(2) 98,1 %, Alex(5) 99,1 %) no implican reconstruccion perceptualmente fiel; PixCorr (0,366) y SSIM (0,413) reflejan una similitud estructural moderada.
- Resultados calculados con una sola muestra de difusion por imagen; la variabilidad entre muestras no se documenta.
- Uso previsto de investigacion: la decodificacion cerebral plantea consideraciones eticas sobre privacidad mental y consentimiento, aunque el modelo solo funciona con datos fMRI del sujeto entrenado.
- Licencia MIT permite uso comercial, pero la dependencia de modelos externos (SDXL, OpenCLIP, VGG) impone sus propias licencias.
- No es un modelo de lenguaje: no admite prompts de texto, tool calling ni agentes; cualquier uso en esos terminos es un error de categoria.
- Sesgos conocidos: no documentados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/teooi/cortexdecoder
- Dataset de flatmaps y reconstrucciones: https://huggingface.co/datasets/teooi/cortexdecoder-nsd-flatmaps
- Codigo en GitHub: https://github.com/teooi/CortexDecoder
- Paper en bioRxiv: https://www.biorxiv.org/content/10.64898/2026.10.09.757766v1
- DOI: 10.64898/2026.10.09.757766
