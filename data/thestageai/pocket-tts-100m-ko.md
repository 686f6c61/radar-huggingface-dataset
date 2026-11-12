# TheStageAI/pocket-tts-100m-ko

## Resumen

pocket-tts-100m-ko es un modelo de síntesis de voz (text-to-speech) en coreano publicado por TheStageAI. No se trata de un modelo entrenado desde cero, sino de una conversión a motores Core ML para Apple Neural Engine (ANE) del fine-tune coreano de 100 millones de parámetros `seastar105/pocket-tts-korean-100m`, que a su vez deriva de `kyutai/pocket-tts` mediante destilación de profundidad desde un profesor coreano de 24 capas.

El modelo resuelve el problema de ejecutar TTS neuronal de calidad en dispositivos Apple (macOS e iOS) sin depender de la nube, aprovechando la aceleración del Neural Engine. El paquete distribuido incluye un motor de flujo (flow LM) en fp16 con capas transformer palettizadas a 6 bits y un decodificador Mimi en fp32 que se ejecuta en CPU.

Es relevante para desarrolladores que necesitan integrar voz sintética coreana en aplicaciones nativas de Apple con latencia baja y sin coste de inferencia en servidor. El repositorio ocupa 0,7 GB y el bundle de motores pesa 143 MB, cifras que lo hacen viable para su inclusión en aplicaciones móviles. La licencia es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow LM transformer (6 capas, d=1024) con cabeza de flujo LSD + decodificador Mimi |
| Parametros totales | 100M (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (flow LM) con capas transformer palettizadas a 6 bits (g8); decodificador Mimi en fp32 |
| Idiomas soportados | coreano (ko) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML / ANE (engines empaquetados en `engines.zip`, cifrado QLPA) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura de `kyutai/pocket-tts`: un modelo de flujo (flow matching) que genera representaciones latentes de audio a partir de texto, acoplado a un decodificador neuronal Mimi que convierte esas representaciones en forma de onda. La variante coreana de 100M se obtuvo por destilación de profundidad desde un profesor coreano de 24 capas, reduciendo el coste computacional para su despliegue en dispositivos.

La conversión de TheStageAI mantiene el flow LM en fp16 pero aplica palettización de 6 bits (g8) a las capas transformer, que se ejecutan en el ANE, mientras que el decodificador Mimi en fp32 se ejecuta en CPU. Los motores están cifrados con QLPA. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus coreano ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada.

## Capacidades

- Síntesis de voz a partir de texto en coreano.
- Generación de audio mediante flow matching con cabeza de flujo LSD.
- Decodificación de audio con Mimi en CPU, separada del cómputo en ANE.
- Voces incluidas: azelma (por defecto), alba, charles, cosette, javert y marius. Son clips de referencia en inglés de Kyutai codificados por este modelo; el autor no distribuye un prompt nativo en coreano.
- Ejecución en Apple Neural Engine (ANE) para el flow LM y en CPU para el decodificador.
- Integración con el SDK de TheStage para Apple (`model_type: pocket-tts`, bundle de idioma `ko`).
- No se ha documentado soporte de tool calling, agentes, visión ni audio de entrada.

## Casos de uso

- Lectura de textos en voz alta en aplicaciones iOS y macOS: el modelo sintetiza coreano de forma local en el dispositivo, sin enviar texto a servidores externos, lo que simplifica el cumplimiento de privacidad.
- Asistentes de voz nativos para Apple: al ejecutarse sobre ANE, puede integrarse en apps de asistente conversacional con latencia baja y sin coste por petición.
- Accesibilidad: conversión de contenido escrito (noticias, documentos, correos) en audio coreano para usuarios con discapacidad visual, aprovechando el tamaño reducido del bundle de 143 MB.
- Aprendizaje de idiomas: generación de pronunciación coreana para aplicaciones educativas, con voces múltiples para variar el material de escucha.
- Audiolibros y pódcast generados: síntesis por lotes en macOS de textos largos con las seis voces disponibles, usando el motor local para evitar cuotas de API.
- Prototipado de interfaces de voz: evaluación de la calidad del TTS coreano en un Mac antes de decidir un despliegue mayor, gracias a la disponibilidad del paquete Core ML listo para usar.
- Integración en apps de navegación o conducción: instrucciones de voz en coreano generadas en el dispositivo sin conexión de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Diseñado para Apple Neural Engine: requiere hardware Apple con ANE (chips de la serie M y A recientes).
- El flow LM se ejecuta en ANE y el decodificador Mimi en CPU; no se especifican requisitos mínimos de memoria en la información disponible.
- VRAM estimada: no aplicable en el sentido convencional; al ejecutarse en dispositivo, el consumo depende del chip Apple concreto. El bundle de motores ocupa 143 MB.
- GPU recomendadas: no aplica; el despliegue previsto es en hardware Apple (macOS e iOS) con ANE.
- No cabe en GPU consumer NVIDIA mediante este paquete, ya que los pesos están en formato Core ML y cifrados QLPA.
- Opciones de despliegue: SDK de TheStage para Apple (`model_type: pocket-tts`), con los motores de `subscription/macos_ios/engines.zip`. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pocket-tts-100m-ko (este) | 100M | coreano | Core ML / ANE | CC-BY-4.0 | Hugging Face (TheStageAI) |
| seastar105/pocket-tts-korean-100m | 100M | coreano | no disponible | CC-BY-4.0 | Hugging Face |
| kyutai/pocket-tts | no disponible | ingles (referencia) | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta coreano; no se ha documentado cobertura multilingüe.
- Las voces incluidas son clips de referencia en inglés de Kyutai codificados por el modelo; el autor no distribuye un prompt nativo en coreano, lo que puede afectar a la naturalidad o al acento de la voz generada.
- Los motores están cifrados con QLPA, lo que limita su inspección, modificación y reutilización fuera del SDK de TheStage.
- El formato Core ML restringe el despliegue a hardware Apple; no es portable a GPUs NVIDIA ni a servidores Linux convencionales.
- Riesgo de alucinación y de pronunciación incorrecta en textos con nombres propios, siglas o terminología especializada; no se han publicado evaluaciones al respecto.
- No se dispone de información sobre sesgos del corpus de entrenamiento ni sobre su composición.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero conviene verificar las condiciones del SDK de TheStage y del modelo base antes de distribuirlo en producción.
- No hay datos publicados de latencia, throughput ni calidad subjetiva (MOS) en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheStageAI/pocket-tts-100m-ko
- Modelo base coreano: https://huggingface.co/seastar105/pocket-tts-korean-100m
- Modelo original: https://huggingface.co/kyutai/pocket-tts
