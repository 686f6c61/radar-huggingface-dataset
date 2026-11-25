# Vision-Decision/sam3-line

## Resumen

sam3-line es una cabeza de decodificacion de 2,33 millones de parametros disenada para acoplarse a SAM 3 (facebook/sam3) y convertir un objeto segmentado de una fotografia o un video en un dibujo a linea de tinta, manteniendo intacto el resto del fotograma. Lo desarrolla Vision-Decision y se publica bajo una licencia propia (`sam3-line`) que restringe el uso a investigacion y fines no comerciales. El modelo resuelve un problema muy concreto de estilizacion selectiva: en lugar de aplicar un filtro global a la imagen, permite nombrar un objeto (por ejemplo, "perro") y redibujarlo como ilustracion mientras el fondo conserva su aspecto fotografico original.

Tecnicamente no es un modelo generativo autonomo, sino un decodificador tipo U-Net condicionado por FiLM que consume caracteristicas FPN de SAM 3 (ViT con entrada a 1008 px, congelado) y una query de instancia obtenida por mask-pooling. El resultado es un mapa de tinta en escala de grises a resolucion del recorte (lado largo 512 px). Su interes reside en que demuestra que una cabeza muy pequena (2,3 M de parametros) entrenada por destilacion de un profesor determinista puede producir estilizacion temporalmente estable sin reentrenar el backbone.

El modelo es relevante para quienes trabajan en pipelines de segmentacion y posproduccion porque se integra sobre SAM 3 ya existente, anade un coste marginal de 2,2 ms por objeto en H200 y ofrece soporte de video con una tasa de aproximadamente 2 fotogramas por segundo a 1080p con un objeto. No incluye los pesos de SAM 3, que deben descargarse por separado desde el repositorio oficial (con acceso restringido).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza U-Net de decodificacion (LineDecoder) condicionada por FiLM sobre caracteristicas FPN de SAM 3 ViT (backbone congelado) |
| Parametros totales | 2.328.801 (solo la cabeza; SAM 3 se descarga aparte) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; recorte de lado largo 512 px) |
| Tipos de cuantizacion | no disponible; pesos publicados en fp32 |
| Idiomas soportados | no disponible (el prompt textual de objeto depende de SAM 3) |
| Licencia | `sam3-line` (investigacion y uso no comercial); requiere ademas la SAM License de facebook/sam3 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` |

## Arquitectura y entrenamiento

El pipeline descrito en la model card es el siguiente: se extrae un recorte del objeto (RGB + mascara, lado largo 512 px), se pasa por el codificador ViT de SAM 3 a 1008 px de entrada (congelado) para obtener caracteristicas FPN con stride 7, y adicionalmente se calcula una query de instancia mediante mask-pooling. El LineDecoder es una U-Net a resolucion completa del recorte, condicionada por FiLM con esa query, que produce un dibujo de tinta en grises (1 = tinta negra). SAM 3 no se incluye en el repositorio: se descarga desde `facebook/sam3`, que esta restringido y exige aceptar su licencia.

El entrenamiento se basa en destilacion desde un profesor de un solo paso: SD-Turbo afinado como pix2pix-Turbo sobre dibujos a linea generados con Qwen-Image-Edit-2511, que etiqueto aproximadamente 6.300 recortes de objeto. Se opto por un profesor determinista para evitar el promedio borroso que una cabeza pequena aprende de un editor estocastico. Para el soporte de video se generan pseudo-videos moviendo cada recorte por una trayectoria de camara suave aleatoria (pan, zoom, roll, temblor de mano) con deriva de iluminacion, ruido de sensor y oscilacion del borde de la mascara, 8 fotogramas por clip, con los targets deformados de forma identica. La funcion de perdida combina L1 y LPIPS contra el dibujo del profesor por fotograma, mas un termino de parpadeo (desviacion estandar por pixel a lo largo del tiempo de los dibujos reinyectados en la foto base). Entrenamiento: 8.000 pasos, batch de 2 clips x 8 fotogramas, AdamW con learning rate 5e-4, en una unica H200.

## Capacidades

- Estilizacion selectiva de objetos: dado un prompt textual de objeto y una imagen, redibuja solo la region enmascarada como linea de tinta.
- Segmentacion asistida por prompt: hereda de SAM 3 la capacidad de localizar el objeto nombrado y generar la mascara correspondiente.
- Procesamiento de video: aplica la estilizacion fotograma a fotograma con tracking implicito heredado de SAM 3, con un termino de perdida especifico para reducir el parpadeo temporal.
- Salida de tinta en escala de grises a resolucion del recorte (lado largo 512 px), reinyectable sobre la imagen original.
- Integracion como modulo Python (`SamLine.from_pretrained`) y como CLI (`python -m sam_line.image` y `python -m sam_line.video`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de imagen a imagen.

## Casos de uso

- Ilustracion editorial selectiva: redibujar a linea el sujeto principal de una fotografia de prensa o producto mientras el fondo permanece fotografico, util para portadas y articulos con un flujo de un solo comando.
- Animacion y motion graphics: procesar clips de video para convertir un personaje u objeto en dibujo animado manteniendo el entorno real, con la tasa de ~2 fps a 1080p que permite previsualizar tomas cortas.
- Previsualizacion de storyboards: a partir de material rodado, generar versiones a linea de elementos clave para comunicar intencion visual antes de la animacion final.
- Filtros interactivos en aplicaciones creativas: integrar la cabeza sobre un servicio de segmentacion SAM 3 ya desplegado, aprovechando su coste marginal de 2,2 ms por objeto en lote de 16.
- Docencia y divulgacion cientifica: extraer a linea un especimen, pieza o mecanismo concreto de una fotografia para diagramas explicativos, sin alterar el contexto de la imagen.
- Prototipado de estilos graficos: evaluar rapidamente como quedaria un objeto redibujado a tinta antes de encargar una ilustracion manual, gracias a la naturaleza determinista del profesor destilado.
- Investigacion en destilacion de cabezas ligeras: servir de referencia reproducible para estudiar estabilidad temporal (metrica de flicker) en tareas de estilizacion sobre backbones congelados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible; no aplican a un modelo de vision de este tipo. La model card si aporta metricas de validacion y velocidad:

| Metrica | Valor |
|---|---|
| LPIPS frente al profesor (clips de pseudo-video) | 0,116 |
| Flicker (desviacion estandar temporal por pixel) | 0,0208 |
| Flicker de los targets deformados (referencia por remuestreo) | 0,0134 |
| Cabeza sola, por objeto (batch 16, H200 bf16) | 2,2 ms |
| Codificador SAM 3 + cabeza, por objeto (batch 16) | 22 ms |
| Codificador SAM 3 + cabeza, por objeto (batch 1) | 31 ms |
| Video 1080p con un objeto, extremo a extremo con tracking | ~2 fps |

## Requisitos de hardware

- VRAM: la cabeza es minima (2,33 M de parametros en fp32, unos 9 MB); el grueso del consumo lo determina SAM 3, cuyo codificador ViT a 1008 px exige una GPU con memoria holgada. No se especifica cifra exacta de VRAM en la informacion disponible.
- GPU recomendadas: el autor reporta medidas en una NVIDIA H200. Para el codificador SAM 3 conviene una GPU de datacenter (A100, H100, H200); no se confirma que quepa comodamente en GPU de consumo.
- GPU de consumo: no disponible la confirmacion; la cabeza por si sola cabria en cualquier GPU, pero el backbone condiciona el requisito real.
- Despliegue: el repositorio ofrece CLI y API Python (`sam_line`); no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput: 2,2 ms por objeto para la cabeza (batch 16), 22-31 ms por objeto incluyendo el codificador SAM 3, y ~2 fps en video 1080p con un objeto, todo en una H200 con bf16.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones publicadas frente a alternativas en la informacion proporcionada. Como referencia cualitativa de la categoria:

| Modelo | Enfoque | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sam3-line | Cabeza de estilizacion a linea sobre SAM 3 | 2,33 M (cabeza) | Recorte 512 px | No comercial | Hugging Face + GitHub |
| facebook/sam3 | Segmentacion promptable | no disponible | no disponible | SAM License (gated) | Hugging Face |
| Editores de imagen generativos (p. ej. basados en difusion) | Edicion global o por region | miles de millones | variable | variable | variable |

La comparativa cuantitativa con modelos de estilizacion equivalentes no esta disponible.

## Limitaciones y advertencias

- Solo dibuja lo que cubre la mascara: los objetos sostenidos por el sujeto quedan fuera salvo que se pidan explicitamente.
- Objetos pequenos (por debajo de ~200 px) salen difusos; las texturas densas y saturadas (por ejemplo, colas de pavo real) se convierten en tono gris en lugar de lineas.
- Un unico estilo de tinta; los fotogramas se dibujan de forma independiente, por lo que persiste cierto parpadeo de trazo en video.
- Licencia restrictiva: los pesos son solo para investigacion y uso no comercial segun LICENSE.md; ademas, ejecutarlos requiere SAM 3 bajo la SAM License, cuyo acceso esta restringido.
- Dependencia de un backbone externo pesado: el rendimiento real y los requisitos de memoria vienen de SAM 3, no de la cabeza.
- Riesgo de fallo en la deteccion del objeto: si SAM 3 no localiza correctamente el objeto nombrado, la estilizacion se aplica sobre la region equivocada.
- No apta para generacion de texto, razonamiento ni tareas multimodales mas alla de la estilizacion de imagen y video.
- No se documentan sesgos especificos ni evaluaciones de robustez fuera del conjunto de validacion sintetico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vision-Decision/sam3-line
- Repositorio de codigo y ejemplos: https://github.com/Vision-Decision/sam-line
- Modelo base SAM 3: https://huggingface.co/facebook/sam3
- Ejemplo de video (perro corriendo): https://raw.githubusercontent.com/Vision-Decision/sam-line/main/examples/dog_run.gif
