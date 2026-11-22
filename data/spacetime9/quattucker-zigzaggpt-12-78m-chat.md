# spacetime9/QuatTucker-ZigZagGPT-12-78M-Chat

## Resumen

QuatTucker-ZigZagGPT-12-78M-Chat es la variante afinada por instrucciones (SFT) del modelo base QuatTucker-ZigZagGPT-12-78M, desarrollado por Shubham Barmase, investigador independiente. Se trata de un transformer de 77,6 millones de parametros totales con un backbone de 39,0 millones, entrenado originalmente sobre 1.050 millones de tokens del corpus FineWeb-Edu y posteriormente ajustado con el dataset Alpaca Cleaned para tareas de conversacion.

El interes del modelo reside en su propuesta arquitectonica: utiliza nucleos tensoriales hipercomplejos compartidos (descomposicion de Tucker sobre cuaterniones) y un esquema de enrutamiento trenzado de arriba hacia abajo ("braided top-down routing") que, segun el autor, reduce a la mitad los parametros del backbone de un transformer convencional. Es, por tanto, un experimento de investigacion sobre eficiencia estructural mas que un modelo de proposito general.

Esta variante Chat anade un formato de prompt sencillo (`User: ... / Assistant:`) y fue entrenada durante 1.500 pasos sobre 51.704 pares instruccion/respuesta. Por su tamano y su limitado volumen de ajuste, debe considerarse un prototipo academico con capacidades conversacionales basicas, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con descomposicion de Tucker sobre cuaterniones y enrutamiento trenzado (ZigZag) |
| Parametros totales | 77,6 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento SFT con T=256) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,3 GB; probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

El modelo se basa en la propuesta "Quaternion-Tucker ZigZag Networks", que sustituye parte de los componentes lineales del transformer por nucleos tensoriales hipercomplejos compartidos, descompuestos mediante Tucker, y anade un mecanismo de enrutamiento jerarquico de arriba hacia abajo. El objetivo declarado es reducir a la mitad los parametros del backbone (39,0 M frente a los 77,6 M totales) manteniendo la capacidad expresiva. El modelo base se entreno con 1.050 millones de tokens de FineWeb-Edu, alcanzando una perdida de validacion de 3,5849 y una perplejidad de 36,05.

El ajuste SFT uso `yahma/alpaca-cleaned` (51.704 pares instruccion/respuesta con enmascarado de tokens de prompt mediante `-100`). El entrenamiento consistio en 1.500 pasos con batch de 16, acumulacion de gradiente de 2, longitud de secuencia 256, learning rate de 5e-5 con decaimiento coseno hasta 5e-6, ejecutado en una NVIDIA L4 durante 821,6 segundos. La perdida descendio de 2,9446 a 2,2251. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generacion de texto en ingles y respuesta a instrucciones simples en formato conversacional.
- Seguimiento basico de instrucciones tras el ajuste SFT con Alpaca.
- Generacion de listas y respuestas estructuradas sencillas (segun los ejemplos de la model card).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo "thinking".
- Multilingue: limitado a ingles; no hay evidencia de capacidades en otros idiomas.

## Casos de uso

- Experimentacion academica sobre arquitecturas eficientes: sirve como banco de pruebas reproducible para comparar el backbone QuatTucker-ZigZag frente a un transformer denso de tamano equivalente en tareas de lenguaje.
- Prototipado de chatbots de bajo coste en ingles: con 77,6 M de parametros puede ejecutarse en CPU o GPU de gama baja para demos de dialogo simple con el formato `User:`/`Assistant:`.
- Generacion de respuestas breves en entornos con recursos muy limitados: su tamano permite desplegarlo en dispositivos edge o contenedores pequenos, siempre que la calidad exigida sea baja.
- Investigacion sobre SFT a pequena escala: el registro detallado de hiperparametros (1.500 pasos, L4, 821,6 s) lo convierte en una referencia para estudiar el efecto del ajuste por instrucciones en modelos pequenos.
- Educacion y divulgacion: util para ilustrar en clase como se comporta un modelo de ~78 M de parametros antes y despues del SFT, incluidos sus fallos factuales.
- Base para ablaciones arquitectonicas: permite a otros investigadores partir de un checkpoint ya ajustado para instrucciones y modificar componentes del backbone sin reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los unicos datos de rendimiento proporcionados son del modelo base y del proceso de SFT:

| Metrica | Valor |
|---|---|
| Perdida de validacion (base, FineWeb-Edu) | 3,5849 |
| Perplejidad (base, FineWeb-Edu) | 36,05 |
| Perdida SFT (inicio -> fin) | 2,9446 -> 2,2251 |
| Pasos SFT | 1.500 |
| Tiempo de entrenamiento SFT | 821,6 s (NVIDIA L4) |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (77,6 M de parametros ~ 0,31 GB de pesos), y por debajo de 0,2 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria; el autor entreno el SFT en una NVIDIA L4. Tambien funciona en CPU.
- Cabe en GPU consumer: si, incluidas GTX 1050, RTX 3050, RTX 4090 y similares; incluso en Raspberry Pi con llama.cpp si se convierte a GGUF.
- Opciones de despliegue: no se documentan oficialmente; al ser un transformer estandar en pesos PyTorch, es compatible en principio con Hugging Face Transformers, y potencialmente con llama.cpp/Ollama si se genera la conversion GGUF (no verificada por el autor).
- Latencia y throughput: no disponibles. Por el tamano, se espera una latencia de milisegundos por token en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| QuatTucker-ZigZagGPT-12-78M-Chat | 77,6 M (39,0 M backbone) | no disponible | MIT | Hugging Face | Prototipo de investigacion con backbone hipercomplejo |
| GPT-2 small | 124 M | 1.024 tokens | MIT | Hugging Face | Referencia clasica de transformers pequenos |
| DistilGPT-2 | 82 M | 1.024 tokens | MIT | Hugging Face | Version destilada de GPT-2, ampliamente usada |
| TinyLlama-1.1B-Chat | 1,1 B | 2.048 tokens | Apache 2.0 | Hugging Face | Chat de mayor calidad, pero 14 veces mas grande |

No se dispone de benchmarks comparativos publicados para situar el rendimiento de este modelo frente a las alternativas.

## Limitaciones y advertencias

- Calidad conversacional muy limitada: los ejemplos de la propia model card contienen errores factuales evidentes (por ejemplo, la definicion de gravedad es incorrecta), lo que indica un riesgo alto de alucinacion.
- Entrenamiento SFT corto (1.500 pasos, T=256) y sobre un unico dataset pequeno: la adherencia a instrucciones complejas sera debil.
- Solo ingles: no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Longitud de contexto no documentada; el SFT uso secuencias de 256 tokens, por lo que es probable que el contexto efectivo sea muy corto.
- No hay soporte documentado de tool calling, agentes ni modos avanzados; no apto para pipelines de agentes.
- Licencia MIT: permite uso comercial, pero el modelo no esta validado para produccion y su calidad no lo hace recomendable para ello.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso por la comunidad ni de validacion independiente.
- Modelo de investigacion: la arquitectura propuesta (QuatTucker-ZigZag) no cuenta con replicaciones externas conocidas en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spacetime9/QuatTucker-ZigZagGPT-12-78M-Chat
- Modelo base: https://huggingface.co/spacetime9/QuatTucker-ZigZagGPT-12-78M
- Preprint (DOI): https://doi.org/10.5281/zenodo.24424502
- Codigo y paper en GitHub: https://github.com/shu195/QuatTucker-ZigZagGPT
- Dataset SFT: https://huggingface.co/datasets/yahma/alpaca-cleaned
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
