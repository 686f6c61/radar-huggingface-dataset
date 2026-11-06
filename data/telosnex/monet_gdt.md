# telosnex/monet_gdt

## Resumen

monet_gdt es un modelo ONNX de extraccion de caracteristicas de imagen, desarrollado por telosnex, disenado especificamente para derivar temas visuales (tipografia, paleta de color y formas decorativas) a partir de una imagen de fondo de pantalla. No es un modelo generativo ni un LLM: es un extractor de caracteristicas con multiples cabeceras que, en una sola pasada, puntua 10 palabras de estado de animo (usadas para elegir fuentes), selecciona una triada de color de tres componentes y puntua 29 formas decorativas. Es el modelo on-device de las aplicaciones basadas en libmonet.

El modelo parte de PE-Core tiny (Meta), concretamente de la variante `timm/vit_pe_core_tiny_patch16_384.fb`, y conserva unicamente los primeros 6 bloques transformer a 224 px, con cabeceras ligeras anadidas. Se ha destilado desde un profesor afinado a 384 px. El resultado es un unico grafo ONNX con pesos de 8 bits, de 5,55 MB, con latencia de 10-16 ms en un nucleo de CPU de Apple Silicon.

Su relevancia actual radica en que resuelve el problema del theming dinamico local (sin servidor, sin latencia de red) a partir de la imagen que el usuario ya ha elegido, con un coste computacional minimo y una licencia permisiva (Apache-2.0). La version documentada es la 2026.10.30.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (PE-Core tiny, primeros 6 bloques transformer a 224 px) con cabeceras ligeras |
| Parametros totales | no disponible (pesos ONNX de 8 bits, 5,55 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | pesos de 8 bits incluidos en el grafo ONNX |
| Idiomas soportados | no disponible (modelo de imagen; las etiquetas de mood son palabras en ingles segun la metadata) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`monet_gdt.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer derivado de PE-Core tiny (Meta), del que se conservan los primeros 6 bloques transformer trabajando a 224 px. Sobre la caracteristica compartida de 192 dimensiones (`feature`, float [1, 192]) se montan cabeceras pequenas que producen las tres salidas: puntuaciones de mood (float [1, 10]), triada de color (int64 [3, 3], RGB 0-255) y puntuaciones de formas (float [1, 29]). El modelo fue destilado desde un profesor afinado a 384 px. La entrada es una imagen uint8 de cualquier tamano (el grafo redimensiona internamente).

El entrenamiento uso aproximadamente 75K imagenes: fotos CC0 de dominio publico de Megalith-10m, fotos CC0 elegidas por su aspecto de fondo de pantalla e imagenes sinteticas de MONET generadas por modelos Apache-2.0. Las etiquetas de mood y formas se generaron con Jev (jev-1.14.0) respondiendo a preguntas fijas, mientras que las etiquetas de color provienen de codigo, concretamente de la regla `MonetGdtRule20261030` de monet_ui 1.0.1, que prioriza colores vivos frente a areas grandes. El modelo no usa RLHF ni DPO; es un modelo de extraccion de caracteristicas entrenado por supervisacion contra etiquetas automaticas.

## Capacidades

- Extraccion de embedding de imagen de 192 dimensiones compartido entre todas las cabeceras.
- Puntuacion de 10 palabras de estado de animo (mood) a partir de la imagen, usadas para seleccionar tipografias.
- Seleccion de una triada de color RGB (primario, secundario, terciario) siguiendo una regla que prioriza colores vivos.
- Puntuacion de 29 formas decorativas para theming.
- Procesamiento de imagenes de cualquier resolucion (redimensionado interno en el grafo).
- Inferencia on-device en CPU, sin necesidad de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues de texto; no es un modelo de lenguaje.
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Theming dinamico de aplicaciones moviles: la app toma el fondo de pantalla elegido por el usuario y genera automaticamente una paleta de tres colores coherente y una seleccion de fuentes, todo en el dispositivo con 10-16 ms de latencia por imagen.
- Personalizacion de la interfaz en escritorio: integracion en aplicaciones de escritorio basadas en libmonet para adaptar colores y formas decorativas al fondo del usuario sin llamadas a servidor.
- Generacion de temas para widgets y pantallas de bloqueo: el modelo puntua formas decorativas y moods para ajustar la estetica de componentes de UI de forma consistente con la imagen de fondo.
- Aplicaciones de galeria o fondos de pantalla: al importar una imagen, el modelo calcula al vuelo la triada de color y las puntuaciones de mood para previsualizar temas antes de aplicarlos.
- Herramientas de diseno ligero: dado que el grafo es de 5,55 MB y corre en CPU, puede embeberse en utilidades de edicion de imagenes para sugerir paletas y estilos tipograficos.
- Sistemas empotrados o entornos sin red: por su tamano reducido y su ejecucion via ONNX Runtime en CPU, es adecuado para dispositivos con recursos limitados donde no se desea enviar imagenes a la nube por privacidad.
- Clasificacion estetica de fondos de pantalla: usar las puntuaciones de mood y formas para filtrar o agrupar imagenes por estilo visual en un catalogo.

## Benchmarks y rendimiento

Resultados medidos contra las etiquetas en imagenes retenidas del entrenamiento. La ultima columna corresponde a la misma pregunta formulada dos veces al etiquetador, que representa el techo practico.

| Head | Measure | monet_gdt | Repeticion del etiquetador |
|---|---|---|---|
| Mood | Pearson r medio, split de test | 0,866 | no disponible |
| Mood | Pearson r medio, 1.951 fondos reales nunca vistos en entrenamiento | 0,776 | no disponible |
| Formas | top-1 coincide con la etiqueta | 0,36 | 0,53 |
| Formas | forma top etiquetada dentro del top 3 del modelo | 0,61 | 0,72 |

Colores, sobre 1.934 fotos tipo fondo de pantalla retenidas:

| Measure | 2026.10.30 | 2026.10.27 |
|---|---|---|
| ΔE a la triada de la regla (menor es mejor) | 24,6 | 32,3 |
| Jev: falta un color vivo, con una muestra apagada (de 512) | 3 | 43 |
| Jev: un color de mota pequena (de 512) | 12 | 0 |

En votaciones ciegas, una primera version de la nueva cabecera de color supero a la 2026.10.27 por 34 a 8, y la 2026.10.30 supero a esa primera version por 35 a 15.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta pensado para CPU y el grafo ONNX ocupa 5,55 MB en disco.
- GPU recomendadas: no requeridas; el modelo se ejecuta en CPU. Cualquier GPU compatible con ONNX Runtime podria ejecutarlo, pero no es el objetivo de diseno.
- Compatibilidad con GPU de consumo: si, pero innecesaria; el modelo esta optimizado para CPU.
- Opciones de despliegue: ONNX Runtime (`onnxruntime`), tal como se muestra en la model card; integracion via libmonet en aplicaciones.
- Latencia y throughput: 10-16 ms por imagen en un nucleo de CPU de Apple Silicon, segun la model card.

## Comparativa con modelos similares

No se dispone de datos sobre modelos comparables en la informacion proporcionada. monet_gdt es un extractor de caracteristicas especializado en theming, no un modelo de vision general ni un LLM, por lo que la comparacion con modelos de la misma categoria requeriria informacion adicional no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| monet_gdt | no disponible (5,55 MB ONNX, 8 bits) | no aplica | Mood r=0,866 (test); formas top-1 0,36 | Apache-2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los colores favorecen areas vivas frente a areas grandes; el modelo a veces elige un color que cubre solo una parte pequena de la imagen.
- Las imagenes sinteticas usadas en entrenamiento son saturadas y centradas; ayudan en fondos de pantalla pero cuestan algo de precision de mood en fotos cotidianas.
- Uso fuera de alcance: cualquier decision sobre personas, incluido juzgar a una persona en una foto, moderacion de contenido o clasificacion/busqueda de imagenes. Las palabras de mood describen el aspecto de una imagen, no su sujeto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero las puntuaciones de mood y formas son aproximaciones con techo practico limitado (top-1 de formas 0,36 frente a 0,53 del etiquetador).
- Limitaciones de contexto o idioma: no es un modelo de texto; las etiquetas de mood estan en ingles segun la metadata (`monet_gdt.mood_words`).
- Restricciones de licencia: Apache-2.0 permite uso comercial; los pesos derivan de PE-Core (Apache-2.0, Meta), ver NOTICE. El codigo de entrenamiento es MIT.
- Caveat para produccion: el modelo depende de la metadata incrustada en el grafo (`monet_gdt.mood_words` y `monet_gdt.shapes`) para interpretar las salidas; conviene validar esa metadata en el pipeline de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/telosnex/monet_gdt
- Dataset de etiquetas: https://huggingface.co/datasets/Telosnex/monet_gdt_labels
- Codigo, entrenamiento y evaluacion: https://github.com/Telosnex/monet_gdt
- Libreria libmonet: https://github.com/Telosnex/libmonet
- Paquete monet_ui: https://pub.dev/packages/monet_ui
- Modelo base: https://huggingface.co/timm/vit_pe_core_tiny_patch16_384.fb
