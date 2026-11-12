# Titan48/FishingQwen-v113-GGUF-test

## Resumen

FishingQwen-v113-GGUF-test es un ajuste fino (finetune) del modelo Qwen/Qwen3-1.7B, desarrollado por el usuario Titan48 y publicado en Hugging Face. Se trata de un asistente experimental en ruso especializado en pesca, pensado para integrarse en la aplicacion «Rybosled» (Рыбослед). El modelo parte de la revision 70d244cc86ccca08cf5af4e1e306ecf908b1ad5e de Qwen3-1.7B y se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M, orientado a inferencia local en dispositivos ARM64 mediante llama.cpp.

La relevancia de esta publicacion es limitada y muy especifica: no es un modelo de proposito general ni un lanzamiento de un laboratorio, sino un candidato experimental de un asistente de dominio vertical. El autor declara explicitamente que se trata de pesos reales fusionados (no un servicio remoto ni respuestas predefinidas), pero tambien advierte de que el modelo presenta errores conocidos de fecha, aritmetica e interpretacion de series, y de que la cuantizacion Q4_K_M aun no se habia medido en hardware Samsung en el momento de publicar la model card.

Con 1.720.574.976 parametros totales (aproximadamente 1,7 mil millones), hereda la licencia Apache-2.0 del modelo base. El repositorio ocupa 1,1 GB, coherente con una unica cuantizacion Q4_K_M. No cuenta con descargas ni valoraciones, y el entrenamiento posterior esta declarado como pausado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3-1.7B; detalles especificos de la arquitectura no disponibles) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del transformer Qwen/Qwen3-1.7B mediante la fusion de un adaptador denominado v113 (piloto contextual). Segun la model card, el adaptador se entreno con 96 actualizaciones y 1536 ejemplos sinteticos. No se especifican en la informacion disponible detalles sobre la composicion del dataset, el numero de tokens de entrenamiento, ni si se emplearon tecnicas de RLHF, DPO u otras variantes de alineacion.

El resultado se exporto a GGUF con cuantizacion Q4_K_M para inferencia local en dispositivos ARM64 a traves de llama.cpp. La model card indica que el modelo debe usarse preferentemente en modo non-thinking y con preguntas cortas, y que funciones como clima, fechas, aritmetica y coordenadas deben delegarse a fuentes externas de la aplicacion, ya que los pesos GGUF no tienen acceso a pronosticos, mapas, hora actual ni datos de organizadores de pesca. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ruso, orientada a preguntas sobre pesca.
- Asistencia de dominio vertical: respuestas sobre practicas de pesca dentro del contexto de la aplicacion «Rybosled».
- Inferencia local en dispositivos ARM64 mediante llama.cpp.
- Modo non-thinking recomendado por el autor para el uso previsto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor desaconseja delegar en el modelo tareas de calculo o datos externos.
- Capacidades multilingues: limitadas al ruso segun los metadatos del repositorio.
- Capacidades especiales (vision, audio, thinking mode avanzado): no disponible.

## Casos de uso

- Asistente de pesca dentro de una aplicacion movil: el modelo responderia preguntas cortas del usuario sobre tecnicas y conceptos de pesca en ruso, ejecutandose localmente en el dispositivo ARM64 sin depender de un servicio remoto.
- Generacion de texto offline en dispositivos de gama media: al estar cuantizado en Q4_K_M y ocupar 1,1 GB, puede desplegarse en telefonos o placas ARM64 con llama.cpp para funcionalidades de texto sin conexion.
- Prototipado de asistentes de dominio vertical: sirve como base experimental para evaluar como se comporta un Qwen3-1.7B ajustado con ejemplos sinteticos en un nicho concreto, antes de invertir en un entrenamiento mayor.
- Respuestas de caracter informativo y no critico: dado que el autor prohibe su uso para confirmar seguridad en hielo o agua, legalidad de la pesca o garantia de capturas, el modelo solo es adecuado para contenido divulgativo de bajo riesgo.
- Investigacion sobre ajuste fino de modelos pequenos: util para estudiar el efecto de adaptadores con pocos pasos (96 actualizaciones) y datasets sinteticos pequenos (1536 ejemplos) en un modelo de 1,7B.
- Evaluacion de pipelines de exportacion GGUF: el repositorio documenta el proceso de fusion de adaptador y cuantizacion, por lo que puede emplearse como referencia tecnica para replicar el flujo con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica ademas que la cuantizacion Q4_K_M de este candidato aun no se habia medido en un dispositivo Samsung en el momento de su publicacion, y que las pruebas automaticas de interfaz de usuario no miden la calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB para la cuantizacion Q4_K_M (tamano del repositorio); el consumo real de memoria puede ser algo superior por el contexto y el runtime.
- GPU recomendadas: no disponible; el autor orienta el modelo a dispositivos ARM64 con llama.cpp, no a GPU de escritorio.
- Compatibilidad con GPU de consumo: por tamano, cabria en GPU de consumo con al menos 2 GB de VRAM, aunque no se documenta soporte ni rendimiento en esas plataformas.
- Opciones de despliegue: llama.cpp (via principal documentada); otros runtimes compatibles con GGUF no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponible; no se publican mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| FishingQwen-v113-GGUF-test | 1,72B | no disponible | GGUF (Q4_K_M) | Apache-2.0 | Finetune de dominio (pesca) en ruso, experimental |
| Qwen/Qwen3-1.7B (base) | 1,72B | no disponible en esta ficha | safetensors y otros | Apache-2.0 | Modelo generalista del que deriva; multilingue |
| Otros finetunes de Qwen3-1.7B | variable | no disponible | variable | variable | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de FishingQwen-v113 con el modelo base ni con alternativas de la misma categoria.

## Limitaciones y advertencias

- Errores documentados por el autor: confusion entre la edad de un mensaje y el horizonte de pronostico, errores en fechas, interpretacion incorrecta de series de datos, omision de nombres de especies y consejos inexactos.
- Prohibicion explicita de uso para confirmar seguridad en hielo o agua, legalidad de la pesca, presencia de peces, profundidades o garantia de captura.
- El modelo no tiene acceso a pronosticos meteorologicos, mapas, hora actual ni datos de organizadores; cualquier dato de ese tipo debe provenir de fuentes externas.
- La temperatura del aire no equivale a la del agua; el modelo no debe usarse para inferencias de ese tipo.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: elevado en las areas que el propio autor senala como erroneas (fechas, aritmetica, series, especies).
- Limitacion idiomatica: entrenado y evaluado para ruso; no se documenta soporte de otros idiomas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base y debe conservarse la atribucion y el texto de licencia originales.
- Estado del proyecto: entrenamiento posterior pausado; los errores se recogen mediante informes voluntarios; sin descargas ni validacion comunitaria.
- La cuantizacion Q4_K_M no estaba medida en hardware Samsung al publicarse la model card; el tamano, la suma de comprobacion y la revision se publicarian tras la exportacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Titan48/FishingQwen-v113-GGUF-test
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Repositorio de llama.cpp (runtime recomendado): https://github.com/ggerganov/llama.cpp
