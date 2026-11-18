# XENLook/xenart-lora-v1.4

## Resumen

XenArt LoRA v1.4 es un adaptador de estilo (LoRA) para el modelo de generacion de imagen Z-Image de Tongyi-MAI, desarrollado por el usuario XENLook. Su funcion es desplazar la salida del modelo base hacia ilustracion pictorica de tipo museistico, alejandola del fotorrealismo, mediante once "carriles" estilisticos que cubren tradiciones pictoricas de distintas regiones: pintura a tinta de Asia Oriental, mural egipcio, mural clasico europeo, simbolismo europeo, nihonga japones, ilustracion de libro infantil coreano, muralismo latinoamericano, romanticismo nacional nordico, miniatura tradicional del sur de Asia, ilustracion narrativa estadounidense y grafica editorial.

El adaptador se entrena exclusivamente con imagenes de dominio publico o acceso abierto (CC0 o Public Domain Mark) procedentes de museos, lo que simplifica su uso comercial. No requiere palabra de activacion: el estilo se invoca mediante frases de estilo en lenguaje natural dentro del prompt. La version 1.4 corrige un defecto de la 1.3 por el que las imagenes de Asia Oriental aparecian a menudo como pergaminos colgantes montados, con bordes oscuros y marcos de seda envejecida.

Se distribuye como un unico archivo safetensors de 170 MB en BF16, con rango 32 y 480 tensores, y esta pensado para cargarse en ComfyUI sobre el flujo de trabajo de Z-Image Base (no destilado). Su licencia MIT facilita la integracion en productos comerciales, siempre que se respete la licencia del modelo base Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo de difusion Z-Image; prefijo de claves `diffusion_model.*` |
| Parametros totales | no disponible (adaptador de 480 tensores, rango 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | pesos del adaptador en BF16; el modelo base se entrena con base qfloat8; no se listan otras cuantizaciones del adaptador |
| Idiomas soportados | en, ko |
| Licencia | MIT (adaptador); modelo base Apache-2.0 |
| Formato de pesos | safetensors (`xenart-lora-v1.4.safetensors`, 170 MB, BF16) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 con alpha 32, entrenado sobre Z-Image (Tongyi-MAI/Z-Image, revision `04cc4abb7c5069926f75c9bfde9ef43d49423021`), modelo base no destilado. El entrenamiento se realizo con ai-toolkit 0.13.32, optimizador AdamW de 8 bits, learning rate 1e-4, batch size 1, 8.000 pasos, precision bf16, funcion de perdida de flow matching y base cuantizada en qfloat8. Se usaron buckets de resolucion de 768 y 1024 y un caption dropout de 0.05.

El conjunto de datos consta de 1.409 imagenes distintas y 1.901 pares de entrenamiento (492 copias adicionales de imagenes de los carriles nordic, us_narrative y egypt_mural con una descripcion mas corta). Todos los materiales son de dominio publico o acceso abierto. No hay palabra de activacion: el control de estilo se realiza mediante frases de estilo incluidas en el prompt. En la version 1.4 se recortaron las imagenes de Asia Oriental al area pintada, se eliminaron 91 imagenes que no podian limpiarse (escaneos multipanel, formas de abanico, sellos dentro del area pintada) y se retiraron de las descripciones las menciones a pergaminos, montajes, sellos e inscripciones.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con estilo pictorico controlado mediante frases de estilo.
- Once carriles estilisticos: `ea_ink_scroll`, `editorial_graphic`, `egypt_mural`, `eu_classical_mural`, `eu_symbolist`, `jp_nihonga`, `kr_picturebook`, `latam_mural`, `nordic`, `sasia_traditional` y `us_narrative`.
- Desplazamiento deliberado de la salida hacia pintura manual y textura de lienzo, con reduccion del aspecto fotografico.
- Soporte de textura de pincelada especifica por carril: `painted canvas texture` para los carriles de lienzo (nordic, us_narrative, eu_symbolist, eu_classical_mural, latam_mural) y `hand-painted surface texture` para el resto.
- Control de contenido negativo mediante prompt negativo (texto, letras, caligrafia, sellos, firmas, marcas de agua, fotografia, fotorrealismo, render 3D).
- Compatibilidad con el flujo de trabajo de ComfyUI para Z-Image Base y con cargadores LoRA estandar.
- No soporta tool calling, agentes, razonamiento multi-paso ni modalidades de audio o video: es exclusivamente un adaptador de estilo para generacion de imagen.

## Casos de uso

- Ilustracion editorial con estetica de grabado o revista: usando el carril `editorial_graphic` con la frase de estilo correspondiente, se generan escenas urbanas o conceptuales con acabado grafico no fotografico, adecuadas para articulos y portadas.
- Material didactico y libros infantiles: el carril `kr_picturebook` produce ilustraciones de libro infantil con textura de pintura manual, utiles para editoriales educativas que necesitan coherencia estilistica en series.
- Reproduccion de estilos historicos para divulgacion: los carriles `egypt_mural`, `eu_classical_mural` y `sasia_traditional` permiten generar escenas con la composicion y paleta de esas tradiciones para museos, exposiciones y contenido cultural.
- Diseno de murales y arte publico: los carriles `latam_mural` y `us_narrative` sirven para bocetos de murales con pincelada visible y composicion narrativa, utiles en propuestas para espacios publicos.
- Ambientacion de proyectos audiovisuales y videojuegos: los carriles `nordic` y `eu_symbolist` generan arte conceptual con textura de lienzo para definir la direccion visual de un proyecto antes de la produccion.
- Preservacion y reinterpretacion de patrimonio: al estar entrenado solo con imagenes CC0 o de dominio publico, el adaptador permite generar variaciones de estilos historicos sin arrastrar material con derechos, lo que simplifica la publicacion comercial de las imagenes resultantes.
- Prototipado rapido en ComfyUI: con 35 pasos, CFG 4.0 y fuerza LoRA 1.0 a 768x1024, se pueden iterar variaciones de estilo en un flujo de trabajo estandar sin reentrenar el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta una evaluacion cualitativa: en la misma evaluacion de 176 imagenes, los bordes de montaje vistos en la version 1.3 (aproximadamente 12 de 32 imagenes de Asia Oriental) ya no aparecen en la version 1.4.

## Requisitos de hardware

- El adaptador pesa 170 MB en BF16; el requisito real de VRAM lo determina el modelo base Z-Image, no el LoRA.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada (depende de la cuantizacion y del backend del modelo base).
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende del modelo base Z-Image.
- Despliegue: ComfyUI con el flujo de trabajo de Z-Image Base y un cargador LoRA estandar (las claves usan el prefijo `diffusion_model.*`). No se mencionan otros backends como vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponible en la informacion proporcionada. Los ajustes de referencia son 768x1024, 35 pasos, CFG 4.0 y fuerza LoRA 1.0.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XenArt LoRA v1.4 | LoRA de estilo sobre Z-Image | 480 tensores, rango 32, 170 MB | no aplica | MIT (adaptador); base Apache-2.0 | Hugging Face, ComfyUI |
| Z-Image (Tongyi-MAI) | Modelo base text-to-image | no disponible | no aplica | Apache-2.0 | Hugging Face |
| Otros LoRA de estilo para Z-Image | Adaptadores de estilo | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con otros adaptadores de estilo en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de texto espurio: segun la model card, a veces aparecen letras pequenas en elementos como letreros o relojes; el prompt negativo incluye terminos para mitigarlo, pero no lo elimina por completo.
- Dependencia del modelo base: el adaptador no incluye Z-Image; requiere descargar y cargar el modelo base Apache-2.0 por separado y respetar su licencia y su aviso NOTICE.
- Especificidad del prompt: funciona mejor con el formato exacto de la model card (`, <contenido><BRUSH>, wordless painted scene, clean unmarked surfaces`); prompts fuera de ese formato pueden degradar el estilo.
- Cobertura linguistica limitada: solo se declaran ingles y coreano; no hay garantia de comportamiento con prompts en castellano.
- Sesgos: al entrenarse con imagenes de museo de dominio publico, el adaptador puede heredar los sesgos de representacion de esas colecciones (epoca, geografia y tematica de las obras digitalizadas).
- Alucinacion visual: como todo modelo de difusion, puede generar elementos anatomicos o compositivos incorrectos, especialmente en escenas con muchas figuras.
- Uso comercial: el adaptador es MIT, pero la licencia del modelo base es Apache-2.0 y debe verificarse por separado; las imagenes generadas no incorporan material con derechos segun la model card, aunque no se ofrece una garantia legal explicita.
- Sin soporte de otras modalidades: no hay tool calling, agentes, audio ni video; es exclusivamente un adaptador de estilo para generacion de imagen.

## Enlaces

- Hugging Face: https://huggingface.co/XENLook/xenart-lora-v1.4
- Modelo base: https://huggingface.co/Tongyi-MAI/Z-Image
- Repositorio de ai-toolkit (herramienta de entrenamiento): no disponible en la informacion proporcionada
- Paper o blog del modelo base: no disponible en la informacion proporcionada
- Demos: no disponible en la informacion proporcionada
