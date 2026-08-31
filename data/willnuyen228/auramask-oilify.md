# WillNuyen228/auramask-oilify

## Resumen

auramask-oilify es un modelo de transformacion de imagen a imagen desarrollado por WillNuyen228 que aplica un efecto de pintura al oleo sobre fotografias, preservando la identidad de los rostros mediante perdidas basadas en extractores de caracteristicas faciales como ArcFace y VGGFace. El modelo esta entrenado sobre el dataset FDF y combina metricas de calidad perceptual (TopIQ) con similitud coseno de embeddings faciales, lo que permite generar resultados esteticamente atractivos sin degradar el reconocimiento de la persona. Se distribuye bajo licencia GPL-3.0 y esta implementado en Keras, con soporte adicional para TFLite segun las etiquetas del repositorio.

La arquitectura, segun la informacion publicada, se compone de una red tipo VNet con un bloque discriminador y un encoder, entrenada de forma adversarial con un esquema de perdidas multiobjetivo. El tamaño del repositorio es de solo 0.1 GB, lo que indica un modelo relativamente ligero, adecuado para inferencia en entornos con recursos limitados. Aunque la documentacion es escasa y contiene errores tipograficos, el modelo parece orientado a aplicaciones de edicion fotografica y filtros artisticos en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VNet (red convolucional) con componente adversarial (D y E) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (imagen) |
| Licencia | GPL-3.0 |
| Formato de pesos | Keras (H5/Keras), con soporte TFLite segun tags |

## Arquitectura y entrenamiento

El modelo se basa en una arquitectura VNet (declarada como modelo base junto a ArcFace y VGGFace) con un bloque discriminador (D) y un encoder (E) cuyas dimensiones se especifican en los parametros JSON proporcionados. La configuracion incluye filtros de 16, 32, 64, 128 y 128, activacion ReLU, regularizacion L2 y salida de 3 etiquetas, lo que sugiere una red convolucional relativamente compacta. El entrenamiento se realizo con el optimizador Adam (learning rate 1e-4, clipnorm 1), batch de 16, 50 epocas y una particion 90/10 entre entrenamiento y validacion.

La funcion de perdida combina tres terminos: TopIQ (metrica de calidad de imagen con referencia completa, peso 0.9), similitud coseno de las caracteristicas extraidas por ArcFace (peso 0.1, umbral 0.68) y error cuadratico medio (peso 0.1). Esta combinacion busca maximizar la calidad percibida mientras se mantiene la identidad facial, utilizando un enfoque adversarial (epsilon 0.03) probablemente para robustecer el modelo frente a perturbaciones. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre el contenido especifico del dataset FDF.

## Capacidades

- Transformacion de imagen a imagen: aplica un filtro estilistico de efecto oleo sobre fotografias.
- Preservacion de identidad facial: mediante perdidas de similitud coseno con embeddings de ArcFace y VGGFace, el modelo mantiene el reconocimiento facial en la salida.
- Mejora de calidad perceptual: optimiza la metrica TopIQ, que correlaciona con la calidad subjetiva de la imagen.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales.
- No se han documentado capacidades multilingues (no aplica al ser un modelo de vision).

## Casos de uso

- Filtros artisticos en aplicaciones de fotografia movil: el modelo puede integrarse como un filtro de "pintura al oleo" en apps de camara o edicion, ofreciendo resultados en tiempo real gracias a su tamaño reducido (0.1 GB).
- Edicion de retratos en estudios de fotografia: al preservar la identidad facial, permite crear retratos con estilo oleo sin perder el parecido con la persona, util en servicios de retratos personalizados o regalos artisticos.
- Restauracion y estilizacion de archivos fotograficos: se puede aplicar sobre fotos antiguas o de baja calidad para generar versiones estilizadas, manteniendo los rasgos de las personas.
- Generacion de contenido para redes sociales: creadores de contenido pueden usar el modelo para producir imagenes con aspecto de pintura, diferenciando su feed o campañas publicitarias.
- Preprocesamiento para datasets de entrenamiento: la transformacion oilify puede servir como aumento de datos en tareas de reconocimiento facial o clasificacion de imagenes, mejorando la robustez de otros modelos.
- Demostraciones educativas de GANs y perdidas perceptuales: el codigo y la configuracion publicados permiten estudiar como combinar metricas de calidad con perdidas de identidad en problemas de image-to-image.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona metricas de entrenamiento (TopIQ-FR, ArcFace Cosine Distance, VGGFace2 Cosine Distance) pero no se proporcionan valores numericos ni comparaciones con otros modelos.

## Requisitos de hardware

- Dado el tamaño del repositorio (0.1 GB), el modelo es ligero y deberia ejecutarse en CPU de gama media o en GPU con menos de 2 GB de VRAM, aunque no se especifican requisitos exactos.
- No se dispone de datos sobre latencia o throughput.
- Al estar implementado en Keras, puede desplegarse con TensorFlow Serving, TFLite para dispositivos moviles o Keras Runtime.
- No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (filtros de efecto oleo con preservacion de identidad). El autor ha publicado variantes como auramask-v2-oilify y auramask-oilify_canvas, pero no hay datos comparativos entre ellas. Modelos de transferencia de estilo como CycleGAN o Fast Neural Style no son directamente comparables por diferencias en objetivo y arquitectura, y no se han encontrado benchmarks comunes.

## Limitaciones y advertencias

- La documentacion es minima y contiene errores (p. ej., "Looks good engough"), lo que dificulta la reproduccion exacta del entrenamiento.
- No se han publicado estudios de sesgos o limitaciones; es probable que el modelo herede sesgos de los datos de entrenamiento (dataset FDF no documentado).
- Al ser un modelo adversarial, puede ser sensible a perturbaciones en la entrada, aunque se uso epsilon 0.03 durante el entrenamiento.
- La licencia GPL-3.0 impone obligaciones de copyleft: cualquier uso comercial o distribucion de derivados debe liberarse bajo la misma licencia.
- No se garantiza la preservacion de identidad en todos los casos; la similitud coseno de ArcFace tiene un umbral de 0.68, por lo que rostros extremos o angulos inusuales podrian degradar el resultado.
- El modelo no maneja texto, por lo que no es adecuado para tareas de generacion o comprension de lenguaje.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/WillNuyen228/auramask-oilify)
- [Variante auramask-v2-oilify](https://huggingface.co/WillNuyen228/auramask-v2-oilify)
- [Variante auramask-oilify_canvas](https://huggingface.co/WillNuyen228/auramask-oilify_canvas)
- [Registro de entrenamiento en W&B](https://wandb.ai/spuds/auramask/runs/8ugiiln3)
