# spinochenza/XORTRON-CriminalComputing-EnablementEngine-v0.3

## Resumen

XORTRON-CriminalComputing-EnablementEngine-v0.3 es un modelo de lenguaje de 31 273 millones de parámetros, desarrollado por spinochenza como parte del proyecto XORTRON Criminal Computing, una iniciativa de investigación abierta centrada en la seguridad y alineación de la inteligencia artificial. El modelo es un ajuste fino (fine-tuning) de `darkc0de/gemma-4-31B-it-updated-heretic`, una variante de la familia Gemma 4 de Google que ha sido modificada mediante técnicas de "abliteration" para eliminar los mecanismos de rechazo y producir respuestas sin censura.

El propósito declarado del proyecto es estudiar los riesgos de la explotación criminal de la IA, tal y como se documenta en el informe del Congreso de los Estados Unidos titulado "Artificial Intelligence and Criminal Exploitation: A New Era of Risk". Este modelo en concreto se presenta como un "motor de habilitación" (enablement engine) dentro de esa línea de investigación, con capacidades conversacionales y un enfoque en contenido potencialmente dañino o tóxico. Su relevancia radica en ser un ejemplo práctico de los peligros de los modelos sin alineación, y en servir como herramienta para analizar y mitigar esos riesgos.

A pesar de estar etiquetado como `image-text-to-text`, no se dispone de información que confirme capacidades multimodales reales; la etiqueta probablemente hereda del pipeline de la librería `transformers`. El modelo está disponible bajo licencia Apache 2.0, pero su uso conlleva importantes advertencias éticas y legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4, 31B) |
| Parametros totales | 31 273 086 512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `darkc0de/gemma-4-31B-it-updated-heretic`, que a su vez deriva de Gemma 4 de Google, una arquitectura transformer densa de 31 000 millones de parámetros. El proceso de ajuste fino ha aplicado técnicas de "abliteration" (eliminación de capas de rechazo) y un entrenamiento adicional en datos conversacionales, probablemente con el objetivo de maximizar la capacidad de generar respuestas sin filtros de seguridad. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO. La etiqueta `unsloth` sugiere que se utilizó la librería Unsloth para optimizar el fine-tuning, pero no hay confirmación oficial.

El proyecto XORTRON se describe como un "experimento de investigación en curso" sobre seguridad y alineación, y el modelo se enmarca en ese contexto. No se dispone de información sobre innovaciones técnicas específicas más allá de la abliteration y el ajuste conversacional.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Respuestas sin censura ni filtros de seguridad (por diseño), lo que incluye contenido potencialmente toxico, ofensivo o ilegal.
- Integracion con pipelines de `transformers` y `text-generation-inference`.
- No se ha confirmado soporte para tool calling, agentes o razonamiento multi-paso.
- No se ha confirmado capacidad multimodal real (la etiqueta `image-text-to-text` no esta respaldada por documentacion).

## Casos de uso

Dado el caracter deliberadamente "uncensored" y potencialmente danino del modelo, sus casos de uso son fundamentalmente de investigacion y analisis de seguridad, no de aplicacion productiva convencional. Se listan escenarios realistas y eticos:

- Investigacion academica en seguridad de IA: el modelo permite estudiar como se manifiestan los comportamientos no alineados, que sesgos emergen y como se pueden detectar o mitigar.
- Evaluacion de riesgos en sistemas de moderacion de contenido: se puede usar para generar ejemplos de texto toxico o peligroso y probar la robustez de clasificadores o filtros.
- Desarrollo de tecnicas de "red teaming": los equipos de seguridad pueden emplear el modelo para simular ataques o generar prompts adversarios y validar defensas.
- Analisis forense de IA criminal: en el marco del proyecto XORTRON, se utiliza para documentar y entender las capacidades de explotacion criminal de los LLM.
- Educacion en etica de la IA: como caso de estudio en cursos sobre alineacion, demostrando los peligros de modelos sin restricciones.
- Pruebas de alucinacion y sesgo en entornos de investigacion: el modelo puede revelar patrones de fabricacion de informacion o sesgos extremos que interesan a los investigadores.

No se recomienda su uso en produccion, atencion al cliente, generacion de codigo o cualquier tarea comercial debido a la falta de alineacion y al alto riesgo de generar contenido inapropiado o ilegal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en precision fp16/bf16 ocupa aproximadamente 62,6 GB (tamano del repositorio). Para inferencia con cuantizacion de 8 bits se necesitarian unos 32 GB de VRAM; con 4 bits, unos 16 GB.
- GPU recomendadas: para precision completa se requieren GPUs profesionales como A100 (80 GB) o H100 (80 GB). Con cuantizacion 4 bits podria ejecutarse en una RTX 4090 (24 GB) o similar, aunque con limitaciones de velocidad.
- No cabe en GPUs de consumo de gama baja (menos de 16 GB) sin cuantizacion agresiva.
- Opciones de despliegue: compatible con `transformers`, `text-generation-inference` (TGI) y `vLLM`. No se ha confirmado soporte para `llama.cpp` u `Ollama`, aunque podria funcionar con conversiones a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XORTRON-CriminalComputing-EnablementEngine-v0.3 | 31,3B | no disponible | Apache 2.0 | Hugging Face |
| darkc0de/XORTRON.CriminalComputing.2026.4B.Instruct.NEXT | 4B | no disponible | no disponible | Hugging Face |
| darkc0de/XORTRON.CriminalComputing.LARGE.2026.3 | 123B | no disponible | no disponible | Hugging Face |
| Gemma 4 31B (base) | 31B | no disponible | Gemma Terms of Use | Google / Hugging Face |

No se dispone de datos de rendimiento comparativo. Los modelos de la serie XORTRON comparten el enfoque de "criminal computing" y la falta de alineacion, pero difieren en tamano y proposito especifico.

## Limitaciones y advertencias

- El modelo esta disenado para generar contenido danino, toxico y potencialmente ilegal. Su uso conlleva riesgos legales y eticos significativos.
- No tiene filtros de seguridad ni mecanismos de rechazo, por lo que puede producir discursos de odio, instrucciones para actividades criminales, desinformacion y otros contenidos peligrosos.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar leyes de difamacion, incitacion a la violencia o propiedad intelectual, responsabilizando al usuario.
- No se ha verificado la exactitud de los datos de entrenamiento ni la procedencia del modelo base; existe riesgo de sesgos extremos y alucinaciones frecuentes.
- Solo soporta ingles, limitando su aplicabilidad en entornos multilingues.
- No se han publicado benchmarks ni evaluaciones de seguridad, por lo que su rendimiento y fiabilidad son desconocidos.
- El modelo no es adecuado para tareas de produccion, atencion al cliente, generacion de codigo o cualquier uso empresarial sin una revision exhaustiva de riesgos.

## Enlaces

- [Hugging Face - spinochenza/XORTRON-CriminalComputing-EnablementEngine-v0.3](https://huggingface.co/spinochenza/XORTRON-CriminalComputing-EnablementEngine-v0.3)
- [Hugging Face - darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3 (mismo modelo, otro autor)](https://huggingface.co/darkc0de/XORTRON-CriminalComputing-EnablementEngine-v0.3)
- [Perfil de la organizacion XORTRON en Hugging Face](https://huggingface.co/xortron)
- [Informe del Congreso de EE.UU.: "Artificial Intelligence and Criminal Exploitation: A New Era of Risk"](https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf)
- [Pagina de soporte en Ko-fi](https://ko-fi.com/xortron)
