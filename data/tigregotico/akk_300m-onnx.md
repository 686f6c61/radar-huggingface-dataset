# TigreGotico/AKK_300m-onnx

## Resumen

AKK_300m-onnx es una exportación a formato ONNX del modelo Thalesian/AKK_300m, un modelo de traducción neuronal entrenado específicamente para trabajar con acadio, una de las lenguas semíticas más antiguas documentadas en escritura cuneiforme. El modelo permite traducir entre acadio cuneiforme, transliteración acadia e inglés, cubriendo un dominio muy especializado que apenas tiene representación en los modelos multilingües generalistas. Está desarrollado por TigreGotico, que además mantiene la librería linguonnx para ejecutar modelos ONNX en CPU.

La arquitectura es un UMT5 de 300 millones de parámetros, con una ventana de contexto de 512 tokens. El repositorio incluye los grafos exportados en precisión fp32 y una cuantización int8, ambos con la división típica encoder/decoder/decoder-con-pasado que linguonnx utiliza para la inferencia. La licencia es Apache-2.0, lo que permite uso comercial y modificación, aunque los corpus subyacentes (Akkademia y CDLI) tienen sus propios términos.

La relevancia de este modelo radica en que ofrece una herramienta práctica para asiriólogos, historiadores y filólogos que necesitan procesar grandes volúmenes de texto cuneiforme sin depender de servicios en la nube o de modelos generales que no han visto acadio. La exportación ONNX está verificada contra el modelo PyTorch original, con coincidencia exacta en tokenización y salida de beam-search, lo que garantiza que no se pierde calidad en la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UMT5 (encoder-decoder transformer) |
| Parametros totales | 300 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | fp32, int8 |
| Idiomas soportados | acadio (cuneiforme y transliteracion), ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos fp32 e int8) |

## Arquitectura y entrenamiento

El modelo base Thalesian/AKK_300m es un UMT5 de 300 millones de parametros, una variante de la familia T5 adaptada para lenguas con sistemas de escritura complejos como el cuneiforme. El tokenizador es un SentencePiece con 256000 piezas base, ampliado con 7090 tokens adicionales definidos en `added_tokens.json` que corresponden a los signos cuneiformes y los diacriticos de transliteracion. Sin este fichero, todos los signos se codifican como `<unk>` sin que se produzca un error.

El entrenamiento del modelo original utilizo corpus del proyecto Akkademia y del CDLI (Cuneiform Digital Library Initiative), aunque no se han publicado detalles sobre el numero exacto de tokens de entrenamiento o el uso de tecnicas como RLHF o DPO. La exportacion ONNX no modifica los pesos; anade los grafos en fp32 e int8 y verifica que la salida coincide exactamente con el modelo PyTorch original en todas las direcciones de traduccion soportadas.

## Capacidades

- Traduccion de acadio cuneiforme a ingles.
- Traduccion de ingles a acadio cuneiforme.
- Traduccion de transliteracion acadia (en caracteres latinos) a ingles.
- Traduccion de ingles a transliteracion acadia.
- Transliteracion de acadio cuneiforme a caracteres latinos simples.
- Seleccion de tarea mediante instruccion previa (p. ej. "Translate Akkadian cuneiform to English: ") unida al texto de entrada con ": ".
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No soporta vision ni audio.

## Casos de uso

- **Investigacion filologica**: los investigadores pueden procesar tablillas cuneiformes digitalizadas (transcritas en Unicode) y obtener una traduccion preliminar al ingles, acelerando la catalogacion de textos en proyectos como el CDLI.
- **Ensenanza de lenguas antiguas**: en cursos de acadio, el modelo permite a los estudiantes verificar sus propias traducciones de textos simples y practicar la transliteracion de signos cuneiformes.
- **Digitalizacion de archivos historicos**: instituciones con colecciones de tablillas digitalizadas pueden generar traducciones masivas en lotes, con un coste computacional minimo al ejecutarse en CPU.
- **Traduccion asistida por ordenador (CAT)**: el modelo puede integrarse en herramientas de traduccion especializadas para que el traductor humano revise y corrija las salidas, reduciendo el trabajo desde cero.
- **Verificacion de transliteraciones**: los asiriologos pueden usar el modelo para convertir automaticamente cuneiforme a transliteracion latina, un paso previo comun para indexar textos en bases de datos.
- **Analisis linguistico comparativo**: los linguistas pueden usar el modelo para extraer patrones de correspondencia entre acadio e ingles, aunque con las limitaciones de contexto de 512 tokens que obligan a dividir textos largos linea a linea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor de la exportacion indica que el modelo original presenta una generalizacion pobre fuera del dominio de entrenamiento, pero no se proporcionan metricas cuantitativas (BLEU, chrF, etc.) en la model card ni en la documentacion de HuggingFace.

## Requisitos de hardware

- El modelo esta disenado para inferencia en CPU mediante la libreria linguonnx, por lo que no requiere GPU dedicada.
- Los pesos fp32 ocupan aproximadamente 1.2 GB (300 millones de parametros × 4 bytes), y la version int8 alrededor de 0.3 GB. El repositorio completo pesa 3.6 GB porque incluye ambas precisiones y los grafos del encoder, decoder y decoder-with-past.
- Puede ejecutarse en portatiles con 8 GB de RAM o menos en la version int8, siempre que el texto se divida en fragmentos de hasta 512 tokens.
- Para despliegue en servidor, se puede usar ONNX Runtime directamente con el backend de CPU (p. ej. `onnxruntime` en Python) o integrarlo en un servicio HTTP con FastAPI.
- La latencia en CPU depende del hardware y de la longitud del texto; no se proporcionan medidas de throughput en la documentacion.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente en la informacion. Aunque existen otros modelos de traduccion para lenguas antiguas (como el latin o el egipcio), no hay una alternativa publica de la misma categoria para acadio con licencia Apache-2.0 y formato ONNX. El modelo base Thalesian/AKK_300m es el unico que se referencia como origen de esta exportacion.

## Limitaciones y advertencias

- La ventana de contexto es de solo 512 tokens, lo que obliga a dividir textos largos linea por linea; esto puede perder coherencia en documentos extensos.
- El modelo generaliza mal fuera del dominio de entrenamiento, segun el autor del modelo original; textos con vocabulario poco frecuente o estilo no academico pueden producir salidas de baja calidad.
- La direccion de transliteracion de cuneiforme a ingles es la mejor soportada; la traduccion inversa (ingles a acuden) puede ser menos fiable.
- No existe una direccion de transliteracion de latin a cuneiforme; el modelo solo translitera de cuneiforme a latin, no al reves.
- El tokenizador requiere el fichero `added_tokens.json`; sin el, todos los signos cuneiformes se convierten en `<unk>` sin error explicito, lo que produce salidas inutilizables.
- La licencia Apache-2.0 permite uso comercial, pero los corpus de entrenamiento (Akkademia y CDLI) tienen sus propios terminos de uso que deben revisarse antes de usar el modelo en produccion.
- El modelo no tiene soporte de tool calling, agentes ni funciones, por lo que no es adecuado para tareas que requieran interaccion con APIs o ejecucion de codigo.

## Enlaces

- [HuggingFace - TigreGotico/AKK_300m-onnx](https://huggingface.co/TigreGotico/AKK_300m-onnx)
- [HuggingFace - Modelo base Thalesian/AKK_300m](https://huggingface.co/Thalesian/AKK_300m)
- [Repositorio linguinougnx](https://github.com/TigreGotico/linguonnx)
- [Proyecto Akkademia](https://www.akkademia.org)
- [CDLI - Cuneiform Digital Library Initiative](https://cdli.ucla.edu)
