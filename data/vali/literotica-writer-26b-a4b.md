# Vali/Literotica-Writer-26B-A4B

## Resumen

Literotica-Writer-26B-A4B es un ajuste fino (LoRA) del modelo Gemma 4 26B-A4B abliterado de TrevorJS, especializado en la generacion de ficcion erotica de formato largo en ingles. Lo desarrolla el usuario Vali y resuelve un problema muy concreto: producir relatos eroticos completos de entre 1.000 y 5.000 palabras a partir de una cabecera breve (titulo, categoria, etiquetas, longitud y premisa), terminando de forma autonoma sin intervencion del usuario.

Tecnicamente se apoya en una arquitectura de mezcla de expertos (MoE) con 128 expertos y 8 activos, lo que da 25.233.142.046 parametros totales con un coste de inferencia mucho menor que un modelo denso del mismo tamano. El ajuste se realizo sobre 9.315 relatos y fragmentos del dataset `detain/literotica-stories`, cubriendo 25 categorias, con 2 epocas de entrenamiento y 668 pasos sobre una sola H100 durante aproximadamente 4,7 horas.

Su relevancia practica esta en el empaquetado: la cuantizacion `i1-Q4_K_M` (16,8 GB) permite ejecutar el modelo en llama.cpp con los expertos en RAM del sistema y una GPU de 8 GB de VRAM. Es importante subrayar que no es un modelo conversacional: se entreno exclusivamente para completado de texto plano y no debe usarse con plantillas de chat ni endpoints de chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), 128 expertos con 8 activos (Gemma 4 26B-A4B) |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | ~4 B (8 de 128 expertos) |
| Longitud de contexto | no disponible (el entrenamiento uso contexto empaquetado de 8.192 tokens) |
| Tipos de cuantizacion | i1-Q4_K_M (16,8 GB, con importance matrix), Q8_0 (26,9 GB); se distribuye tambien el imatrix para generar cuantizaciones propias |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (i1-Q4_K_M, Q8_0) y adaptador LoRA en PEFT/Unsloth; el repositorio incluye safetensors del adaptador |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 26B-A4B, un transformer de mezcla de expertos con 128 expertos y 8 activos por token, en su variante "abliterated" (con los rechazos de contenido eliminados mediante intervencion sobre las direcciones de rechazo). Sobre esa base se aplico un LoRA con rango 64 y alpha 64 sobre las capas de atencion y sobre los 128 expertos, usando la herramienta Unsloth.

El entrenamiento empleo 9.315 relatos y fragmentos del dataset `detain/literotica-stories`, distribuidos en 25 categorias de Literotica, de los cuales 3.003 provenian de relatos mejor valorados. Se realizaron 2 epocas, 668 pasos, batch efectivo de 16, contexto empaquetado de 8.192 tokens y tasa de aprendizaje 2e-4 con decaimiento coseno, todo en una H100 durante unas 4,7 horas. La perdida final fue de 2,36 en entrenamiento y 2,32 en validacion. El formato de entrenamiento es completado de texto plano: cabecera estructurada, linea `STORY:` y relato, sin turnos de conversacion ni instrucciones.

Una innovacion destacable es el uso de una importance matrix derivada de texto narrativo para la cuantizacion i1-Q4_K_M, que reduce drasticamente las palabras corruptas tipicas de Q4_K_M en contracciones (de aproximadamente 1 cada 900 palabras a 1 cada 9.000, frente a 1 cada 6.000 o mas del modelo sin cuantizar).

## Capacidades

- Generacion de ficcion erotica de formato largo en ingles, con relatos completos de 1.000 a 5.000 palabras que terminan de forma autonoma (EOS).
- Seguimiento de una cabecera estructurada con titulo, categoria, etiquetas, longitud objetivo y premisa.
- Escritura por partes: apertura, continuacion y parte final de relatos largos, y capitulos de series, mediante los valores de `Type:` y un bloque `Previously:` con el texto previo.
- Cobertura de 25 categorias de Literotica (relaciones, fetichismo, fantasia, terror erotico, romance, etc.).
- Ajuste aproximado a la longitud solicitada en palabras.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingue: solo ingles.
- No dispone de modo de razonamiento (thinking), vision ni audio.
- No es un modelo conversacional: no admite plantillas de chat ni endpoints `/v1/chat/completions`.

## Casos de uso

- Generacion de relatos eroticos completos para plataformas de ficcion para adultos: se envia la cabecera con titulo, categoria, etiquetas y premisa como prompt de completado y el modelo devuelve un relato cerrado de la longitud pedida, sin necesidad de posprocesado para cerrar la narracion.
- Serializacion de ficcion por entregas: usando `Type: opening of a longer story (part 1 of 3)` y despues `continuation` o `final part`, con el bloque `Previously:` rellenado con los ultimos ~1.500 caracteres, se pueden producir series coherentes de varios capitulos.
- Generacion por lotes en local para autores o editores: con la cuantizacion i1-Q4_K_M cabe en una GPU de 8 GB y permite producir borradores a bajo coste sin depender de APIs externas.
- Prototipado de front-ends de escritura creativa: integrable en SillyTavern en modo Text Completion con plantilla de instrucciones vacia, KoboldCpp en modo historia o cualquier cliente que llame a `/completion` de llama.cpp.
- Experimentacion con cuantizacion: el repositorio incluye el `imatrix.gguf`, lo que permite generar cuantizaciones propias (por ejemplo Q5_K_M o Q6_K) y evaluar el equilibrio calidad/tamano para el dominio narrativo.
- Investigacion sobre contenido explicito y seguridad: sirve como caso de estudio de modelos abliterated y de como el ajuste fino sobre un dataset especifico desplaza el comportamiento del modelo base, util para estudios de alineacion y filtrado.
- Generacion de texto de relleno tematico para pruebas de carga: al ser un modelo de completado puro y determinista en formato, facilita la generacion de volumenes grandes de texto para benchmarks de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento (perdida de entrenamiento 2,36 y de validacion 2,32) y una evaluacion cualitativa de palabras corruptas por cuantizacion (aproximadamente 1 cada 9.000 palabras con i1-Q4_K_M frente a 1 cada 900 con Q4_K_M estandar).

## Requisitos de hardware

- VRAM estimada: unos 8 GB de VRAM con la cuantizacion i1-Q4_K_M (16,8 GB) manteniendo los expertos en RAM del sistema; el modelo completo en Q8_0 ocupa 26,9 GB y requiere mas memoria.
- GPU recomendadas: H100 o A100 para el modelo sin cuantizar o para Q8_0; RTX 4090 (24 GB) para Q8_0 o i1-Q4_K_M con todos los expertos en VRAM; RTX 3060/4060 de 8 GB para i1-Q4_K_M con offload de expertos a RAM.
- Cabe en GPU de consumo: si, con i1-Q4_K_M en tarjetas de 8 GB o mas, y con holgura en tarjetas de 16-24 GB.
- Opciones de despliegue: llama.cpp (recomendado, via `/completion`), llama-server (sin `--jinja` ni `--chat-template`), KoboldCpp en modo historia, SillyTavern en modo Text Completion. No usar Ollama ni LM Studio en modo chat, ni vLLM/TGI con plantilla conversacional.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Literotica-Writer-26B-A4B | 25,2 B totales / ~4 B activos | no disponible | Ficcion erotica en ingles, completado de texto | Apache 2.0 | GGUF y LoRA en Hugging Face |
| TrevorJS/gemma-4-26B-A4B-it-uncensored (base) | 25,2 B totales / ~4 B activos | no disponible | Modelo general abliterated | no disponible | Hugging Face |
| Gemma 4 26B-A4B (original) | 25,2 B totales / ~4 B activos | no disponible | Proposito general con alineacion | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento cuantitativo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido exclusivamente para adultos (18+): el modelo genera ficcion sexual explicita y no debe desplegarse en entornos accesibles a menores.
- No es un modelo conversacional: usarlo con plantillas de chat, endpoints `/v1/chat/completions` o front-ends de rol produce respuestas de estilo asistente o relatos de baja calidad.
- Solo ingles: no hay soporte multilingue entrenado.
- Riesgo de alucinacion y de incoherencia narrativa en relatos muy largos o en continuaciones sin bloque `Previously:` bien rellenado.
- La cuantizacion Q4_K_M estandar (retirada del repositorio) generaba palabras corruptas en contracciones con una frecuencia aproximada de 1 cada 900 palabras; se recomienda i1-Q4_K_M o Q8_0.
- El modelo base es abliterated, lo que elimina los rechazos de contenido del modelo original; esto reduce las salvaguardas frente a contenido danino mas alla del erotismo.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero el contenido generado puede estar sujeto a las politicas de las plataformas de destino y a la legislacion aplicable sobre contenido adulto.
- El modelo no esta afiliado ni respaldado por Literotica; el uso del nombre es descriptivo.
- No dispone de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines que requieran interaccion con herramientas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vali/Literotica-Writer-26B-A4B
- Modelo base: https://huggingface.co/TrevorJS/gemma-4-26B-A4B-it-uncensored
- Dataset de entrenamiento: https://huggingface.co/datasets/detain/literotica-stories
- Literotica (sitio de referencia, sin afiliacion): https://www.literotica.com
- Unsloth (herramienta de ajuste fino): no disponible en la informacion proporcionada
- llama.cpp (runtime recomendado): no disponible en la informacion proporcionada
