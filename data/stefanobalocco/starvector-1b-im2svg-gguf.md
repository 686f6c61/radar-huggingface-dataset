# StefanoBalocco/starvector-1b-im2svg-GGUF

## Resumen

StarVector 1B im2svg es un modelo multimodal especializado en la conversion de imagenes raster a graficos vectoriales SVG. Desarrollado originalmente por el equipo de StarVector (publicado bajo la organizacion `starvector` en Hugging Face), resuelve una tarea concreta de vision-lenguaje: dado un mapa de bits, generar el codigo SVG equivalente preservando formas, colores y estructura. La version aqui documentada es una cuantizacion GGUF publicada por StefanoBalocco para su uso en ComfyUI.

El modelo combina un codificador visual, un proyector multimodal y un decodificador de lenguaje, con 1.434.095.620 parametros totales (aproximadamente 1,43 mil millones). Su pipeline declarado es `image-to-text`, ya que produce SVG como secuencia de texto. La licencia es Apache-2.0 y el unico idioma declarado es el ingles, aunque el SVG generado es codigo independiente del idioma natural.

Esta version GGUF es relevante porque permite ejecutar el modelo en entornos de escritorio con ComfyUI sin necesidad de infraestructura GPU de datacenter, ofreciendo tres niveles de cuantizacion (Q4_0, Q5_0 y Q8_0) que mantienen una fidelidad alta respecto al checkpoint original en FP16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal vision-lenguaje (codificador visual + proyector + decodificador transformer) |
| Parametros totales | 1.434.095.620 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_0, Q5_0, Q8_0 (GGUF); el checkpoint base esta en FP16 |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue un diseno multimodal compuesto por un codificador visual, un proyector que alinea las representaciones visuales con el espacio del decodificador y un decodificador de lenguaje que genera la secuencia SVG token a token. Los archivos GGUF incluyen todos estos componentes (codificador visual, proyector, decodificador, configuracion y tokenizer) en un unico fichero.

En las cuantizaciones Q4_0 y Q5_0, el codificador visual, el proyector y los embeddings de token y posicion se mantienen en Q8_0, mientras que el decodificador se cuantiza al nivel indicado. Segun la model card, con estos ficheros el decodificador coincide con el checkpoint FP16 en el 99-100 % de los tokens top-1 sobre miles de tokens SVG. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Conversion de imagenes raster a SVG: genera codigo vectorial a partir de una imagen de entrada.
- Representacion de formas, colores y estructura grafica en el SVG resultante.
- Procesamiento multimodal imagen-texto mediante codificador visual y decodificador de lenguaje.
- Integracion en flujos de ComfyUI mediante los nodos Load StarVector GGUF, Load Image, Image to SVG y Save SVG.
- Ejecucion local con pesos cuantizados en formato GGUF.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision adicional, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Vectorizacion automatica de logotipos e iconos: a partir de un PNG o JPG de un icono, el modelo genera el SVG equivalente para su uso en interfaces web y sistemas de diseno, evitando el trazado manual.
- Conversion de bocetos a vectores editables: un disenador sube un boceto raster y obtiene un SVG editable en herramientas vectoriales, acelerando el flujo de trabajo creativo.
- Preparacion de assets para impresion y escalado: los SVG generados permiten escalado sin perdida, utiles en carteleria y senaletica donde el raster se degrada.
- Integracion en pipelines de ComfyUI: mediante el nodo Image to SVG, el modelo se encadena con otros nodos de generacion o edicion de imagen para producir salidas vectoriales dentro de un grafo automatizado.
- Digitalizacion de diagramas y esquemas tecnicos: convertir capturas o escaneos de diagramas en SVG manipulables para documentacion tecnica.
- Prototipado rapido en entornos con recursos limitados: las cuantizaciones Q4_0 (1,02 GB) y Q5_0 (1,15 GB) permiten ejecutar el modelo en equipos de escritorio modestos sin GPU de datacenter.
- Generacion de graficos vectoriales para web: producir SVG ligeros y escalables para su insercion directa en paginas HTML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una metrica de fidelidad de cuantizacion: el decodificador de los ficheros GGUF coincide con el checkpoint FP16 en el 99-100 % de los tokens top-1 sobre miles de tokens SVG.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0 GB para Q4_0, 1,15 GB para Q5_0 y 1,53 GB para Q8_0, segun el tamano de los ficheros; el checkpoint FP16 requiere del orden de 2,9 GB (1,43 mil millones de parametros a 2 bytes).
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre deberia poder alojar las cuantizaciones; no hay requisitos especificos publicados.
- Cabe en GPU consumer: si, en la mayoria de tarjetas graficas de gama media y alta con las cuantizaciones Q4_0 y Q5_0.
- Opciones de despliegue: ComfyUI con la extension ComfyUI-StarVector-GGUF; el formato GGUF es compatible con el ecosistema llama.cpp, aunque la model card solo documenta el flujo de ComfyUI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StarVector 1B im2svg (GGUF) | 1,43 mil millones | no disponible | GGUF | Apache-2.0 | Hugging Face |
| starvector/starvector-1b-im2svg (base) | 1,43 mil millones | no disponible | safetensors | Apache-2.0 | Hugging Face |
| Alternativas de vectorizacion especializada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El unico idioma declarado es el ingles; no se documenta soporte multilingue.
- No hay informacion publicada sobre sesgos del modelo ni sobre su comportamiento en dominios especificos.
- Riesgo de alucinacion: como modelo generativo, puede producir SVG con elementos inexistentes o mal formados respecto a la imagen de entrada; no se documentan tasas de error.
- La model card solo garantiza el uso mediante la extension ComfyUI-StarVector-GGUF; otros entornos de inferencia GGUF no estan documentados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion.
- Aunque la licencia es Apache-2.0 (permite uso comercial), conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- La fidelidad de cuantizacion se mide en tokens top-1, no en calidad visual del SVG final; no se aportan metricas de calidad grafica.

## Enlaces

- Repositorio GGUF: https://huggingface.co/StefanoBalocco/starvector-1b-im2svg-GGUF
- Modelo base: https://huggingface.co/starvector/starvector-1b-im2svg
- Extension ComfyUI: https://github.com/StefanoBalocco/ComfyUI-StarVector-GGUF
