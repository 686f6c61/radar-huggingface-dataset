# Suarify/suaradee-v0.4

## Resumen

Suaradee v0.4 es un modelo de síntesis de voz (text-to-speech) para bahasa melayu (malayo de Malasia) desarrollado por Suarify. Se trata de un modelo extremadamente compacto: 7,9 millones de parámetros y un único archivo ONNX de 8,46 MB con pesos cuantizados a int8, lo que permite ejecutarlo en una pestaña de navegador mediante transformers.js (WebGPU o WASM) o en un solo hilo de CPU en Python con onnxruntime, sin necesidad de PyTorch.

El modelo deriva de Paradee-8M-v1.3 (sahilmahendrakar) y se distribuye bajo licencia Apache 2.0. Su relevancia radica en la combinación de tamano minimo, velocidad (aproximadamente 25 veces tiempo real en un hilo de CPU y 15 veces en WebGPU) y despliegue local sin dependencias pesadas, lo que lo hace adecuado para entornos con recursos muy limitados o para procesamiento completamente en el cliente.

La version 0.4 se entrena con aproximadamente el doble de audio que la 0.3 (1.281 frases alineadas, unos 118 minutos) y mejora el error global medido por CER (character error rate) hasta el 5,5 % de mediana y el 9,5 % de media acotada en el conjunto de 200 frases de prueba, con el mejor resultado hasta la fecha en el conjunto held-out (4,8 % / 8,5 %).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo TTS derivado de Paradee-8M-v1.3; exportado a ONNX) |
| Parametros totales | 7,9 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada de hasta 402 fonemas (T ≤ 402) |
| Tipos de cuantizacion | int8 (pesos del archivo `onnx/model_quantized.onnx`) |
| Idiomas soportados | Bahasa Melayu (Malasia), con palabras inglesas comunes del habla malasia |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, 8,46 MB); paquete Python `suaradee-0.4.0-py3-none-any.whl`; modulo JS para transformers.js |

Otros datos tecnicos: salida de audio a 24 kHz mono; entradas `input_ids` (int64 `[1,T]`, ids de fonemas con 0 en cada extremo) y `speed` (float32 `[1]`).

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo (tipo de decoder, mecanismo de atencion o componentes de duracion/pitch). Se sabe que es un modelo TTS de 7,9 M de parametros construido sobre Paradee-8M-v1.3 y exportado a ONNX con pesos int8. La exportacion esta adaptada para ser compatible con WebGPU: sin operadores float64 (el acumulador de fase de pitch se ejecuta en float32), limites de slice de 64 bits acotados y eliminacion de una inversion de ruido innecesaria. El camino de pitch y sonoridad se mantiene intacto para permitir conversion de voz a un segundo hablante.

El entrenamiento de v0.4 parte del conjunto limpio de v0.3 (que descarto 120 de 742 clips que el reconocedor no podia leer) y anade 767 clips nuevos (unos 69 minutos) dirigidos a las categorias debiles: 295 frases de texto general, 136 de malayo con palabras inglesas, 174 conversacionales, 142 con numeros y 20 preguntas. Cada clip nuevo se genero dos veces con semillas distintas y se conservo la variante que el reconocedor leia mejor (se descartaron 31 frases). En total, 1.281 frases alineadas y unos 118 minutos de audio. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Sintesis de voz en bahasa melayu (Malasia) a partir de texto escrito, con salida de audio mono a 24 kHz.
- Manejo de palabras inglesas comunes del habla malasia, limitado a una lista de aproximadamente 430 palabras.
- Normalizacion basada en reglas de numeros, importes, fechas, horas y numeros de telefono, que se leen en malayo.
- Control de velocidad mediante el parametro de entrada `speed`.
- Troceado automatico de texto largo: se divide en finales de frase y se procesa en piezas de como maximo 400 fonemas.
- Ejecucion en navegador (transformers.js con WebGPU o WASM) y en Python con onnxruntime, sin PyTorch.
- Conversion de voz a un segundo hablante segun la model card (el export conserva el camino de pitch y sonoridad), aunque no se detalla el procedimiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje: es exclusivamente un modelo TTS.

## Casos de uso

- Lectura por voz en aplicaciones web sin backend: al ejecutarse en una pestana con transformers.js y WebGPU, el audio se genera en el dispositivo y no se envia texto a ningun servidor, lo que resulta adecuado para interfaces de accesibilidad o lectura de contenido sensible.
- Asistentes de voz para malayo en dispositivos de bajos recursos: con 8,46 MB y unos 25x tiempo real en un solo hilo de CPU, puede integrarse en Raspberry Pi, routers o moviles sin GPU para respuestas habladas de frases cortas.
- Automatizacion de atencion telefonica en malayo: la categoria de call-centre obtiene un CER mediano del 4,3 % en el conjunto de prueba, por lo que sirve para generar avisos de citas, facturas o entregas con texto corto y predecible.
- Generacion de audiolibros o boletines de noticias en malayo: el modelo trocea el texto largo en frases de hasta 400 fonemas y mantiene una voz sintetica femenina consistente; la calidad en texto general (CER mediano del 5,9 %) es suficiente para contenido informativo no critico.
- Prototipado rapido de productos de voz para el mercado malasio: el paquete Python y el modulo JS permiten montar una demo funcional en minutos sin infraestructura GPU, util para validar la experiencia de usuario antes de invertir en un TTS de mayor calidad.
- Pruebas de integracion continua de pipelines de audio: al ser un unico archivo ONNX de 8,46 MB y ejecutarse sin PyTorch, se puede incluir en tests automatizados que verifiquen la generacion de audio y la latencia sin dependencias pesadas.
- Generacion de voces de relleno en videojuegos o prototipos de interfaz conversacional en malayo, donde la calidad "apagada" del audio no es critica y prima el tamano y la velocidad.

## Benchmarks y rendimiento

La model card reporta CER (character error rate, menor es mejor) calculado transcribiendo el audio generado con Whisper large-v3 y comparandolo con el texto original, sobre 200 frases de prueba puntuadas en la misma sesion. La mediana y la media acotada se presentan por categoria:

| Categoria | n | v0.2 | v0.3 | v0.4 |
|---|---|---|---|---|
| Texto general (estilo Wikipedia, nombres, lugares) | 70 | 9,9 % / 13,1 % | 6,4 % / 11,2 % | 5,9 % / 10,2 % |
| Estilo call-centre (citas, facturas, entregas) | 60 | 5,2 % / 6,5 % | 4,9 % / 7,3 % | 4,3 % / 6,2 % |
| Numeros y dinero | 30 | 5,0 % / 6,5 % | 0 % / 5,8 % | 2,2 % / 6,0 % |
| Malayo con palabras inglesas | 20 | 18,4 % / 23,9 % | 19,2 % / 26,2 % | 17,9 % / 24,9 % |
| Preguntas | 10 | 1,7 % / 3,3 % | 0 % / 2,4 % | 0 % / 4,3 % |
| Frases cortas | 10 | 13,5 % / 15,9 % | 0 % / 15,4 % | 4,0 % / 10,2 % |
| Global | 200 | 7,5 % / 10,8 % | 5,9 % / 10,5 % | 5,5 % / 9,5 % |

En el conjunto held-out de 60 frases: v0.4 4,8 % / 8,5 %, v0.2 4,9 % / 8,9 %, v0.3 5,6 % / 10,3 %. El propio autor advierte que el reconocedor se equivoca en aproximadamente el 9 % de los caracteres de los clips de entrenamiento, por lo que diferencias inferiores a 1,5 puntos deben considerarse ruido. No se han publicado resultados de benchmarks estandar de TTS (MOS, MCD, WER con otros reconocedores) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en la practica; el modelo pesa 8,46 MB en int8 y puede ejecutarse en CPU sin GPU.
- GPU recomendadas: cualquier GPU con soporte WebGPU para la ejecucion en navegador; en Python, onnxruntime funciona en CPU. No se especifican modelos concretos de GPU.
- GPU de consumo: cabe sobradamente en cualquier GPU de consumo e integrada; el cuello de botella no es la memoria sino la velocidad del dispositivo.
- Despliegue: onnxruntime + numpy en Python (paquete `suaradee`); transformers.js 3.x en navegador o Node (WebGPU o WASM); demos con Gradio (`examples/gradio_app.py`); Web Space oficial.
- Latencia y throughput: aproximadamente 25x tiempo real en un solo hilo de CPU con onnxruntime; aproximadamente 15x en una pestana de navegador con WebGPU (6x en la primera llamada).
- Almacenamiento: el repositorio ocupa 0,0 GB segun Hugging Face y el archivo ONNX cuantizado 8,46 MB.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de otros modelos TTS en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas verificables frente a las versiones anteriores del mismo modelo y a la referencia de su modelo base.

| Modelo | Parametros | Formato | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| Suaradee v0.4 | 7,9 M | ONNX int8 (8,46 MB) | Malayo (con ingles comun) | Apache 2.0 | CER global 5,5 % / 9,5 % en 200 frases |
| Suaradee v0.3 | No disponible | ONNX | Malayo | Apache 2.0 | Entrenado con 634 frases / 49 min; CER global 5,9 % / 10,5 % |
| Suaradee v0.2 | No disponible | ONNX | Malayo | Apache 2.0 | CER global 7,5 % / 10,8 % |
| Paradee-8M-v1.3 (modelo base) | No disponible | No disponible | No disponible | No disponible | Base de la que deriva Suaradee |

## Limitaciones y advertencias

- Sonido apagado ("muffled") sin cambios desde v0.1: la energia por encima de 4 kHz es de 0,0125 frente a 0,0129 en v0.3 (medida sobre 24 frases), con una cualidad amortiguada y con fase. Procede del entrenamiento del decoder, no del volumen de datos ni de la temporizacion; se probo una reparacion sin entrenamiento y se rechazo (el sonido publicado se prefirio 8 de 8 veces).
- Las palabras inglesas son el punto debil: las frases que mezclan malayo e ingles puntuan alrededor del 18 % de CER y duplicar el audio de entrenamiento no mejoro esa cifra. Solo se manejan palabras inglesas incluidas en una lista de unas 430.
- Ruido por frase: comparando v0.4 con v0.3 frase a frase, 103 mejoraron, 62 quedaron igual y 95 empeoraron; la mejora es agregada.
- Una unica voz femenina sintetica, sin control de emocion ni de estilo.
- Disenado para frases cortas: el texto largo se trocea en finales de frase y en piezas de como maximo 400 fonemas, lo que puede afectar a la prosodia en parrafos largos.
- Los numeros, importes, fechas, horas y telefonos se leen mediante un normalizador basado en reglas; los formatos no contemplados pueden leerse de forma incorrecta.
- Es voz sintetica: el autor pide indicarlo explicitamente cuando se utilice.
- Riesgo de alucinacion acustica: al ser un modelo TTS, puede generar pronunciaciones incorrectas o artefactos en texto fuera de dominio, especialmente en palabras no vistas.
- Licencia Apache 2.0: permite uso comercial con atribucion, pero conviene revisar las condiciones del modelo base Paradee-8M-v1.3 y de los datos de entrenamiento, no detalladas en la informacion disponible.
- El modelo esta creado en 2026-11-16 y no registra descargas ni likes en Hugging Face, por lo que no hay evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suarify/suaradee-v0.4
- Version anterior v0.3: https://huggingface.co/Suarify/suaradee-v0.3
- Demo web (Space): https://huggingface.co/spaces/Suarify/suaradee-web
- Modelo base: https://huggingface.co/sahilmahendrakar/Paradee-8M-v1.3
- Paquete Python: https://huggingface.co/Suarify/suaradee-v0.4/resolve/main/dist/suaradee-0.4.0-py3-none-any.whl
- Archivo ONNX cuantizado: https://huggingface.co/Suarify/suaradee-v0.4/blob/main/onnx/model_quantized.onnx
