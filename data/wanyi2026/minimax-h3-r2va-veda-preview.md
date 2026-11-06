# wanyi2026/Minimax-H3-R2VA-Veda-Preview

## Resumen

Veda-MiniMax-H3 R2VA (Preview) es un checkpoint experimental desarrollado por el usuario wanyi2026 que aplica **Veda**, un metodo de atencion dispersa (sparse attention) aprendida para modelos de difusion de video, sobre **MiniMax-H3** de MiniMaxAI en su variante de generacion reference-to-audio-video (R2VA). El modelo genera video sincronizado con audio a partir de referencias visuales (imagenes o clips) y pistas de audio, resolviendo el problema del coste computacional de la atencion densa en difusion de video de alta resolucion y larga duracion.

La relevancia del checkpoint radica en su enfoque plug-and-play: el predictor de dispersa se almacena en FP8 como un modulo independiente que no modifica los pesos del backbone (MiniMax-H3) ni los del Turbo LoRA, lo que permite acelerar la denoising sin reentrenar el modelo base. Los ejemplos publicados generan clips de 1344x768 a 124 frames (~5,17 segundos) comparando atencion densa frente a Veda con la misma semilla y prompt.

Se trata de una version preview con descargas muy limitadas (57 en el momento de la ficha), afinada durante 600 actualizaciones desde el predictor T2VA sobre clips R2VA de 5,17 segundos. Utiliza el MiniMax-H3 Turbo LoRA para generacion en ocho pasos y presupuestos fijos de 32 tiles de referencia visual y 32 tiles de video actual por tile de consulta y cabeza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion de video (MiniMax-H3) con atencion dispersa aprendida (Veda, block-sparse) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (genera clips de 124 frames, ~5,17 s a 1344x768) |
| Tipos de cuantizacion | FP8 (predictor), dequantizado a BF16 al cargar |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (other) |
| Formato de pesos | no disponible (repo de 0,4 GB; predictor en FP8) |

## Arquitectura y entrenamiento

El modelo combina tres componentes: el backbone MiniMax-H3 para generacion reference-to-audio-video, el MiniMax-H3 Turbo LoRA (de larryvrh) que permite generacion en ocho pasos, y el predictor Veda, un modulo aprendido de atencion block-sparse. Veda selecciona de forma independiente los tiles relevantes de las referencias visuales y del video generado para cada tile de consulta y cabeza de atencion; por el contrario, la atencion sobre texto, condicionamiento del VLM y audio permanece densa, preservando la fidelidad de la senal sonora y del condicionamiento semantico.

El predictor de esta preview se afino durante 600 actualizaciones a partir del predictor T2VA (text-to-video) sobre clips R2VA de 5,17 segundos. Un detalle tecnico importante: el predictor no es un LoRA y no altera los pesos del backbone, lo que permite combinarlo con otros adaptadores y actualizarlo de forma independiente. Los pesos del predictor se almacenan en FP8 y se dequantizan a BF16 en tiempo de carga, reduciendo el footprint en disco (el repo completo ocupa 0,4 GB).

## Capacidades

- Generacion text-to-video con audio sincronizado (text-to-audio-video) a 1344x768, 124 frames y unos 5,17 segundos por clip.
- Generacion reference-to-video (R2VA): mantiene la apariencia de personajes y escenas a partir de imagenes o videos de referencia (hasta 32 tiles de referencia visual).
- Preservacion de la pista de audio original o generacion condicionada por audio de referencia (por ejemplo, voz masculina de referencia o banda sonora fuente).
- Aceleracion de la denoising mediante atencion block-sparse aprendida, con presupuestos fijos de 32 tiles de referencia y 32 tiles de video actual por tile de consulta y cabeza.
- Generacion rapida en ocho pasos gracias al Turbo LoRA.
- Estilos tanto fotorrealistas (persona con animal en exterior) como anime (tren costero, feria al anochecer).
- Comparacion reproducible dense-vs-Veda con misma semilla, prompt y geometria.

## Casos de uso

- **Generacion de avatares parlantes con audio fuente**: dado un video de referencia con apariencia y escena mas una voz de referencia, el modelo genera un clip donde el personaje habla manteniendo la banda sonora original, util para contenido de marketing o redes sociales.
- **Animacion de personajes a partir de una imagen**: con una sola imagen de personaje (por ejemplo, un viajero anime) se genera video con movimiento de camara y escena coherente, adecuado para storyboards animados y previsualizacion creativa.
- **Extension de escenas con referencias multiples**: combinando referencia de personaje y de escena (carnaval al anochecer) el modelo compone planos coherentes, util en produccion de cortos animados de bajo presupuesto.
- **Prototipado rapido de video generativo**: el Turbo LoRA de ocho pasos reduce el coste por clip, ideal para explorar prompts y geometrias antes de una pasada final mas costosa.
- **Investigacion en atencion dispersa para difusion de video**: al ser un predictor plug-and-play en FP8 separado del backbone, sirve como banco de pruebas para estudiar block-sparse attention y su impacto en calidad y velocidad.
- **Comparativas controladas dense vs sparse**: la publicacion de pares de videos con misma semilla y metricas de speedup en la barra de titulo facilita evaluaciones cualitativas y de rendimiento reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los videos comparativos muestran "attention and denoising speedups" en su barra de titulo, pero no proporciona cifras concretas de aceleracion ni metricas de calidad (FVD, VBench, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 0,4 GB (predictor en FP8), pero el backbone MiniMax-H3 y el Turbo LoRA deben cargarse aparte, por lo que el requisito total dependera del tamaño de dichos componentes.
- GPU recomendadas: no disponible. Dada la resolucion (1344x768) y duracion (124 frames) de los clips, es razonable asumir GPUs de gama datacenter o consumer de alta gama, pero no hay cifra oficial.
- Consumer GPU: no disponible; sin datos oficiales de compatibilidad.
- Despliegue: el repositorio enlaza una guia de despliegue (AGENTS.md) y codigo en GitHub (veda-sparse/Miowtion); existe una demo publica en linea. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI (al ser un modelo de difusion de video, estas herramientas de LLM no aplican directamente).
- Latencia y throughput: no disponible; se sabe que la generacion usa ocho pasos con el Turbo LoRA y que Veda aporta aceleraciones de atencion y denoising respecto a la version densa, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Tipo | Atencion | Pasos de muestreo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Veda-MiniMax-H3 R2VA (Preview) | Reference-to-audio-video con sparse attention | Block-sparse aprendida (32+32 tiles) | 8 (Turbo LoRA) | minimax-h3-community | Checkpoint preview en HF, 0,4 GB |
| MiniMax-H3 (base, denso) | Reference-to-audio-video | Densa | no disponible | minimax-h3-community | Disponible en MiniMaxAI/MiniMax-H3 |
| MiniMax-H3 Turbo LoRA | Aceleracion del base | Densa (con LoRA) | 8 | no disponible | Disponible en larryvrh/MiniMax-H3-Turbo-Lora |

La comparacion mas directa es con el propio MiniMax-H3 denso: Veda ofrece la misma salida con atencion dispersa en los componentes visuales, manteniendo densos texto, condicionamiento VLM y audio. No hay datos suficientes para comparar con otros modelos de video-audio de terceros.

## Limitaciones y advertencias

- Es una version **preview** afinada solo durante 600 actualizaciones; la calidad y estabilidad pueden ser inferiores a una version final.
- Los presupuestos de atencion son fijos (32 tiles de referencia y 32 de video actual por tile de consulta y cabeza); no hay mecanismo adaptativo documentado en esta preview.
- El predictor se entreno sobre clips de 5,17 segundos; el comportamiento fuera de esa duracion no esta documentado.
- Licencia "other" (minimax-h3-community): hay que revisar el archivo LICENSE para conocer las restricciones de uso comercial, que no estan resumidas en la model card.
- Idiomas soportados no disponibles; el condicionamiento textual depende de las capacidades del backbone MiniMax-H3.
- Riesgo de alucinacion y artefactos tipico de modelos de difusion de video generativa, agravado por la atencion dispersa en componentes visuales (posible perdida de detalle en zonas no seleccionadas).
- Trazabilidad limitada: el autor es un usuario individual (wanyi2026) y el checkpoint replica contenido de Veda-Sparse/Minimax-H3-R2VA-Veda-Preview; conviene verificar la procedencia de los pesos antes de uso en produccion.
- Metricas de aceleracion y calidad no publicadas: cualquier decision de adopcion requiere evaluacion propia.

## Enlaces

- Hugging Face: https://huggingface.co/wanyi2026/Minimax-H3-R2VA-Veda-Preview
- Demo: https://veda.hanxiao.run/
- Project page: https://veda-sparse.github.io/
- Codigo: https://github.com/veda-sparse/Miowtion/tree/main
- Paper: https://arxiv.org/abs/2605.30325
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Turbo LoRA: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
- Guia de despliegue: AGENTS.md (en el repositorio del codigo)
