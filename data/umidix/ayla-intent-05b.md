# Umidix/ayla-intent-05b

## Resumen

Ayla Intent Model v1.0 (identificador `Umidix/ayla-intent-05b`) es un ajuste fino de Qwen2.5-0.5B orientado a una tarea muy concreta: la clasificación y extracción de intenciones a partir de comandos de voz en un launcher de Android. No es un modelo conversacional de propósito general, sino un clasificador generativo especializado que transforma una frase de usuario en una acción estructurada (por ejemplo, `open_app` con un parámetro de nombre de aplicación) expresada en etiquetas XML. Lo publica el usuario Umidix bajo licencia Apache 2.0.

El modelo tiene 494.032.768 parámetros (aproximadamente 0,5 mil millones), lo que lo sitúa en la gama ultracompacta: el repositorio completo ocupa 0,4 GB y se distribuye en formato GGUF, lo que permite ejecutarlo en dispositivos con recursos muy limitados, incluidos teléfonos móviles. Está etiquetado para uzbeko (uz), ruso (ru) e inglés (en), una combinación coherente con el mercado objetivo declarado por el autor.

Su relevancia práctica no está en el rendimiento bruto, sino en el enfoque: demuestra que un modelo de 0,5B ajustado con un conjunto de datos pequeño y muy específico (3.000 ejemplos) puede resolver de forma fiable un problema de enrutamiento de comandos en un entorno de producción móvil, evitando el coste de latencia y de red de invocar un modelo grande en la nube. La contrapartida es que la información publicada es escasa y no hay validación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen2.5-0.5B); el autor no aporta detalles adicionales |
| Parametros totales | 494.032.768 (aproximadamente 0,5B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la model card no lo especifica; el modelo base Qwen2.5-0.5B admite hasta 32.768 tokens, pero no se confirma que el ajuste conserve esa ventana) |
| Tipos de cuantizacion | No disponible de forma explícita; el repositorio se distribuye en formato GGUF (tags del repo), lo que implica cuantizaciones de la familia Q (Q4, Q5, Q8, etc.) aunque no se enumeran |
| Idiomas soportados | Uzbeko (uz), ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (según las etiquetas del repositorio); no se publican safetensors en el repo, aunque los parámetros totales figuran como dato real de safetensors |
| Tamano del repositorio | 0,4 GB |
| Pipeline declarado | No disponible |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B: un transformer decoder-only con atención causal completa, normalización RMSNorm y las mejoras estándar de la familia Qwen2.5. Sobre esa base, el autor ha realizado un ajuste fino supervisado (SFT) para una tarea de generación estructurada: la salida del modelo es una acción más sus parámetros, serializada dentro de etiquetas XML. No se documenta el uso de RLHF, DPO u otras fases de alineación posteriores al ajuste supervisado.

Los datos de entrenamiento declarados son 3.000 ejemplos, con 3 épocas de entrenamiento y una pérdida final de 0,21. La cobertura de intenciones anunciada incluye seis familias: control de aplicaciones (`open_app`, `close_app`), sistema (`wifi_on`, `flashlight_on`), comunicación (`make_call`, `send_sms`), multimedia (`play_music`, `take_photo`), información (`get_weather`, `search_web`) y alarmas (`set_alarm`, `set_timer`). No se especifica la composición lingüística del conjunto, la proporción entre idiomas, ni si se emplearon técnicas como LoRA o ajuste completo. Tampoco se detalla ninguna innovación técnica adicional (decodificación especulativa, atención lineal, destilación) más allá del propio ajuste.

De las cifras publicadas se deduce una limitación importante: con 3.000 ejemplos para 12 intenciones, la media es de 250 ejemplos por intención antes de repartir entre tres idiomas, lo que sugiere un conjunto de validación muy reducido y poco representativo de la variabilidad real del habla.

## Capacidades

- Generación de comandos estructurados: produce salidas del tipo acción más parámetros dentro de etiquetas XML, un formato directamente parseable por el launcher.
- Clasificación de intenciones para control del sistema: apertura y cierre de aplicaciones, activación de wifi y linterna.
- Intenciones de comunicación: inicio de llamadas (`make_call`) y envío de SMS (`send_sms`).
- Intenciones multimedia: reproducción de música (`play_music`) y captura de fotos (`take_photo`).
- Intenciones de información: consulta meteorológica (`get_weather`) y búsqueda web (`search_web`).
- Intenciones de temporizador: configuración de alarmas (`set_alarm`) y temporizadores (`set_timer`).
- Multilingüismo declarado en uzbeko, ruso e inglés.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse a través de la infraestructura de Inference Endpoints de HuggingFace.
- No hay evidencia de soporte de tool calling general, razonamiento multi-paso, agentes, visión, audio nativo ni modo de pensamiento explícito.

## Casos de uso

- Control por voz de un launcher de Android: el modelo recibe la transcripción del comando y devuelve la acción y sus parámetros en XML, que el launcher ejecuta directamente. Es su caso de uso primario declarado y para el que fue entrenado.
- Automatización doméstica por voz embebida: al caber en 0,4 GB en formato GGUF, puede integrarse en un asistente local que encienda luces o active el wifi sin enviar audio a la nube, reduciendo latencia y preservando privacidad.
- Enrutador de intenciones en pipelines híbridos: usar Ayla como primera etapa barata que resuelve comandos simples y delega en un modelo mayor los que no encajan en sus 12 intenciones, reduciendo el coste de inferencia.
- Asistencia manos libres en conducción: comandos como `make_call` o `play_music` pueden ejecutarse íntegramente en el dispositivo, sin depender de cobertura de red.
- Prototipado rápido de interfaces de voz: sirve como referencia para equipos que quieran construir su propio clasificador de intenciones ajustando un modelo base pequeño con un conjunto de datos propio de pocos miles de ejemplos.
- Accesibilidad: usuarios con movilidad reducida pueden controlar funciones básicas del teléfono mediante voz, con el modelo ejecutándose localmente y sin cuota de uso.
- Aplicación en mercados de Asia Central y la CEI: la combinación uzbeko, ruso e inglés cubre un nicho poco atendido por los asistentes comerciales mayoritarios, que suelen priorizar inglés, chino y grandes lenguas europeas.
- Enrutamiento de SMS y notificaciones: clasificar el texto de un mensaje entrante para decidir si requiere respuesta, archivado o marcado como urgente, reutilizando la misma arquitectura de salida estructurada.

## Benchmarks y rendimiento

La model card únicamente declara una precisión del 100% sobre el conjunto de prueba, junto con la pérdida final de entrenamiento (0,21). No se publican resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, ARC, etc.) ni comparaciones con otros modelos.

| Metrica | Valor | Naturaleza del dato |
|---|---|---|
| Precision en test | 100% | Autodeclarado por el autor, sin especificar tamano ni composicion del conjunto de test |
| Loss de entrenamiento | 0,21 | Autodeclarado por el autor |
| Ejemplos de entrenamiento | 3.000 | Autodeclarado por el autor |
| Epocas | 3 | Autodeclarado por el autor |
| MMLU, HumanEval, GSM8K, etc. | No disponible | No publicados |

La precisión del 100% debe interpretarse con cautela: sin conocer el tamaño del conjunto de prueba, el método de partición ni si hubo solapamiento con el conjunto de entrenamiento, es un dato que no permite estimar el rendimiento en producción con vocabulario o acentos no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 el modelo ocupa aproximadamente 1 GB de pesos, más overhead de contexto y caché KV, lo que sitúa el consumo real en torno a 1,5-2 GB. En cuantización Q8, alrededor de 0,5-0,7 GB; en Q4, alrededor de 0,35-0,5 GB. Estas cifras son estimaciones derivadas del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4060 o superiores. En el extremo profesional, una A100 o H100 estaría enormemente sobredimensionada para este modelo salvo por motivos de agregación de muchas peticiones concurrentes.
- Compatibilidad con GPU de consumo: sí, cabe sobradamente en cualquier GPU de consumo moderna y también en iGPU con memoria unificada.
- Ejecución en CPU y móvil: es viable en CPU mediante llama.cpp, y el tamaño del repositorio (0,4 GB) indica que está pensado para ejecutarse en dispositivos Android, que es el objetivo declarado del proyecto.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales dado el formato GGUF; vLLM y TGI son posibles pero no están confirmados por el autor; la etiqueta `endpoints_compatible` apunta a HuggingFace Inference Endpoints como opción gestionada.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia de extremo a extremo. Dado el tamaño, en hardware de consumo se puede esperar latencia muy baja, pero es una inferencia no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ayla Intent v1.0 (`Umidix/ayla-intent-05b`) | 494 M | No disponible en la model card | Clasificacion de intenciones para launcher Android | Apache 2.0 | GGUF en HuggingFace |
| Qwen2.5-0.5B (`Qwen/Qwen2.5-0.5B`) | 494 M | 32.768 tokens (hasta 131.072 con YaRN, según el modelo base) | Modelo base de proposito general | Apache 2.0 | Safetensors y multiples formatos en HuggingFace |
| Qwen2.5-0.5B-Instruct (`Qwen/Qwen2.5-0.5B-Instruct`) | 494 M | 32.768 tokens | Instrucciones generales y conversacion | Apache 2.0 | Safetensors y GGUF en HuggingFace |
| Otros clasificadores de intenciones de 0,5B ajustados para uz/ru/en | No disponible | No disponible | No disponible | No disponible | No se han identificado alternativas equivalentes en la informacion disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos para la tarea específica de enrutamiento de comandos de launcher. La comparación se limita, por tanto, a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sobreajuste probable: una precisión del 100% con 3.000 ejemplos y 3 épocas es un indicio clásico de sobreajuste o de un conjunto de prueba poco exigente. El rendimiento con formulaciones, acentos o ruido de transcripción no vistos puede degradarse de forma acusada.
- Sesgo de dominio: el modelo está entrenado exclusivamente para comandos de un launcher Android. Fuera de ese dominio (preguntas abiertas, conversación, generación de texto) su comportamiento no está caracterizado y probablemente sea deficiente.
- Riesgo de alucinación estructural: al ser un modelo generativo, puede producir etiquetas XML mal formadas o acciones inexistentes. Cualquier integración en producción debe validar la salida contra un esquema y descartar acciones no reconocidas.
- Idiomas limitados a uzbeko, ruso e inglés. No hay evidencia de soporte de castellano ni de otras lenguas, ni de que el multilingüismo funcione de forma equilibrada entre los tres idiomas declarados (no se publica desglose por idioma).
- Ausencia de datos de evaluación: no hay benchmarks estándar, ni tamaño del conjunto de test, ni matriz de confusión, ni análisis de errores.
- Soporte nulo de la comunidad: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación independiente, de issues resueltos y de mantenimiento verificable.
- Fechas de metadatos anómalas: el repositorio registra como fecha de creación y actualización el 21 de septiembre de 2026, posterior a la fecha de esta ficha, lo que dificulta la trazabilidad de la versión.
- Licencia permisiva pero sin garantías: Apache 2.0 permite uso comercial sin restricciones relevantes, pero el autor no ofrece ninguna garantía de exactitud; la responsabilidad del comportamiento en producción recae íntegramente en quien despliega el modelo.
- Dependencia del modelo base: al derivar de Qwen2.5-0.5B, hereda sus limitaciones de conocimiento y su tokenizador; no se documenta si se modificó el vocabulario para mejorar el soporte del uzbeko.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Umidix/ayla-intent-05b
- Modelo base Qwen2.5-0.5B (referencia): https://huggingface.co/Qwen/Qwen2.5-0.5B
- Modelo base Qwen2.5-0.5B-Instruct (referencia): https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Paper o informe técnico del modelo: no disponible
- Repositorio de código: no disponible
- Demo o espacio interactivo: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; las búsquedas devolvieron exclusivamente páginas de TikTok Shop sin relación con el proyecto.
