# xfauthoux/Imatera_skin_portrait

## Resumen

Imatera Skin Portrait es un adaptador LoRA de rango 16 desarrollado por el usuario xfauthoux para el modelo de difusion FLUX.2 [dev] de Black Forest Labs. Su proposito es corregir uno de los defectos mas citados del modelo base en generacion de retratos: el exceso de suavizado de la piel, que produce un aspecto plastico y poco fotografico. El LoRA anade microtextura realista (poros, ridulas, pecas, variacion de tono) sin necesidad de prompt de activacion.

El adaptador se publica como pesos PEFT en formato `pytorch_lora_weights.safetensors`, con un tamano de repositorio de 0.3 GB, y esta pensado para cargarse directamente en ComfyUI mediante `LoraLoaderModelOnly` sobre el UNET de FLUX.2 [dev]. No modifica el pipeline de texto a imagen ni requiere arquitectura adicional: es un ajuste de bajo rango sobre el modelo de difusion existente.

Es relevante para estudios y desarrolladores que generan retratos editoriales o fotografia de producto con personas y necesitan un acabado documental, ya que el autor documenta comparativas antes/despues con seed fija y fuerza recomendada de 0.6. La licencia figura como desconocida, lo que condiciona su uso comercial hasta que el autor la aclare.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre modelo de difusion FLUX.2 [dev] |
| Parametros totales | no disponible (rango 16; repo de 0.3 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (text-to-image; el contexto lo fija FLUX.2 [dev]) |
| Tipos de cuantizacion | no disponible (pesos LoRA en safetensors; la cuantizacion depende del UNET base) |
| Idiomas soportados | no disponible (los prompts del ejemplo estan en ingles) |
| Licencia | unknown |
| Formato de pesos | safetensors (`pytorch_lora_weights.safetensors`, formato PEFT) |

## Arquitectura y entrenamiento

Se trata de un LoRA de rango 16 aplicado sobre FLUX.2 [dev], el modelo de difusion de Black Forest Labs. El adaptador no introduce cambios arquitectonicos: inyecta matrices de bajo rango en las capas del UNET, de modo que el modelo base conserva su comportamiento general y el LoRA desplaza la distribucion de salida hacia texturas de piel mas realistas. El archivo se distribuye en formato PEFT y se carga con `LoraLoaderModelOnly` en ComfyUI, encadenado entre `UNETLoader` (flux2_dev) y `BasicGuider`.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes, el numero de pasos, la resolucion de entrenamiento ni si se aplicaron tecnicas de regularizacion o captions especificos. El autor no documenta hiperparametros de entrenamiento ni curva de perdida. Tampoco se indica si el ajuste se hizo sobre el modelo completo o sobre una variante cuantizada. La unica informacion tecnica verificable es el rango (16), la ausencia de palabra de activacion y la fuerza recomendada (0.6, ampliable hasta 1.0).

## Capacidades

- Generacion de retratos fotograficos con microtextura de piel: poros, ridulas, pecas y variacion de tez.
- Correccion del sesgo de suavizado del FLUX.2 [dev] base, sin cambiar el estilo global de la imagen.
- Funciona sin trigger word: se activa por la sola presencia del LoRA en el grafo, lo que simplifica los prompts.
- Compatible con el pipeline text-to-image de FLUX.2 [dev]: herencia de sus capacidades de composicion, iluminacion y encuadre.
- Ajuste de intensidad continuo entre 0.0 y 1.0, con 0.6 como punto de equilibrio recomendado.
- Integracion directa en ComfyUI mediante nodos nativos (`LoraLoaderModelOnly`).
- No aporta capacidades de tool calling, agentes, vision ni audio: es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Retrato editorial para publicaciones: con fuerza 0.6 y prompts de iluminacion natural (ventana, 85 mm, f/2) se obtienen imagenes con acabado de revista sin retoque posterior de piel.
- Fotografia de producto con modelo humano: campanas de cosmetica o moda que requieren tez realista para que el producto no desentone con una piel excesivamente lisa.
- Generacion de avatares y material de marca: retratos consistentes para webs corporativas o fichas de equipo, donde el aspecto plastico del modelo base resulta poco creible.
- Previsualizacion de casting y storyboards: generacion rapida de referencias de personajes con edad y rasgos especificos (por ejemplo, mujer de 45 anos con canas incipientes y pecas) antes de una sesion real.
- Ilustracion editorial y prensa: imagenes de acompanamiento con estetica documental, donde la textura de piel aporta verosimilitud y evita la sensacion de imagen sintetica.
- Prototipado de pipelines de difusion: banco de pruebas para estudiar como un LoRA de bajo rango modifica la distribucion de texturas sin reentrenar el modelo base, util en investigacion sobre control fino de modelos generativos.
- Contenido para formacion y simulacros: retratos de personas ficticias con rasgos realistas para materiales que no pueden usar imagenes de personas reales por proteccion de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente aporta una comparativa cualitativa antes/despues con prompt, seed (424242), 28 pasos, guidance 4.0, sampler euler y resolucion 896x1152.

| Configuracion | Resultado descrito |
|---|---|
| Sin LoRA | Piel suavizada, aspecto plastico |
| LoRA 0.6 | Textura realista con rasgos faciales estables |
| LoRA 1.0 | Textura mas documental, pero enfria y desatura la imagen y altera ligeramente los rasgos |

## Requisitos de hardware

- VRAM: el LoRA en si ocupa muy poco (repo de 0.3 GB); el requisito real lo marca FLUX.2 [dev], no el adaptador.
- GPU recomendadas: no disponible en la informacion proporcionada para FLUX.2 [dev]; el adaptador no anade requisitos propios.
- GPU de consumo: no disponible; depende de la variante y cuantizacion del modelo base que se cargue.
- Despliegue: ComfyUI es la via documentada por el autor (`UNETLoader` → `LoraLoaderModelOnly` → `BasicGuider`). Otros entornos compatibles con PEFT y safetensors no estan documentados.
- Latencia y throughput: no disponibles; el coste adicional del LoRA sobre la inferencia del modelo base no se ha medido publicamente.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Rango / fuerza | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Imatera Skin Portrait (xfauthoux) | LoRA de textura de piel | FLUX.2 [dev] | rango 16; 0.6 recomendado | unknown | Hugging Face, 0 descargas |
| FLUX.2 [dev] sin adaptador | Modelo de difusion completo | - | - | la de Black Forest Labs | Hugging Face |
| Otros LoRA de piel para FLUX | LoRA de textura | FLUX.1 / FLUX.2 | no disponible | variable | ecosistema ComfyUI / Civitai |

No se dispone de datos verificables de benchmarks ni de alternativas equivalentes documentadas en la informacion proporcionada, por lo que la comparacion cuantitativa con otros LoRA de realismo de piel no esta disponible.

## Limitaciones y advertencias

- Licencia `unknown`: no hay autorizacion explicita para uso comercial; conviene contactar con el autor antes de integrarlo en produccion.
- A partir de fuerza 0.8-1.0 el LoRA enfria y desatura la imagen completa y modifica ligeramente los rasgos faciales; el propio autor lo advierte.
- Sin trigger word, el efecto se aplica siempre que el LoRA este cargado, lo que impide desactivarlo selectivamente por prompt.
- Especifico de retratos: puede introducir textura no deseada en primeros planos de otras superficies (productos, tejidos, fondos).
- No hay datos de sesgo demografico: se desconoce como responde ante distintos tonos de piel, edades o etnias, un riesgo relevante en generacion de personas.
- Riesgo de alucinacion visual inherente a los modelos de difusion: rasgos, manos y detalles anatomicos pueden ser inconsistentes, y el LoRA no corrige ese comportamiento.
- Sin informacion sobre el dataset de entrenamiento: no se puede descartar contaminacion con imagenes de personas reales ni evaluar su procedencia.
- Modelo practicamente sin adopcion (0 descargas, 0 likes) y sin validacion independiente; el repositorio se actualizo por ultima vez en noviembre de 2026.
- Depende de FLUX.2 [dev]: cualquier restriccion de licencia o limitacion del modelo base se hereda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xfauthoux/Imatera_skin_portrait
- Modelo base FLUX.2 [dev]: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Sitio del desarrollador (Imatera): https://imatera.fr
- Repositorio de ComfyUI (entorno de carga documentado): https://github.com/comfyanonymous/ComfyUI
