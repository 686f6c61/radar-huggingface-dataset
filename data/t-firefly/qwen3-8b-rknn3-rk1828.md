# t-firefly/qwen3-8b-rknn3-rk1828

## Resumen

Este modelo es una distribución del Qwen3-8B original, convertido por el equipo Firefly AI para ser ejecutado en el coprocesador de IA RK1828 de Rockchip. La conversión permite desplegar un LLM de 8 mil millones de parámetros en dispositivos edge, como las placas de desarrollo de Firefly que integran un SoC RK3588 como host y el RK1828 como acelerador de inferencia. El resultado es un modelo listo para usar con la herramienta LlamaPi, que gestiona la descarga, carga y ejecución.

Qwen3-8B es un modelo de lenguaje causal de la familia Qwen3, desarrollado por el equipo Qwen de Alibaba. Soporta modos de pensamiento (thinking) y de no pensamiento, más de 100 idiomas y está diseñado para tareas de instrucción, diálogo, programación, razonamiento y agentes. Esta versión RKNN3/RK1828 no modifica el comportamiento del modelo original, solo adapta los pesos al formato requerido por el acelerador.

La relevancia de esta distribución radica en llevar modelos de 8B a dispositivos de bajo consumo y bajo coste, sin depender de GPUs de servidor. Permite construir aplicaciones de IA generativa en el borde, con inferencia local y privacidad de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) basado en Qwen3-8B |
| Parametros totales | 8B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo original Qwen3-8B soporta hasta 32 768 tokens, pero no se especifica en esta conversion) |
| Tipos de cuantizacion | No especificado (repositorio en formato GGUF) |
| Idiomas soportados | Mas de 100 idiomas y dialectos (segun la model card del modelo original) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (y RKNN para RK1828, segun la distribucion de Firefly) |

## Arquitectura y entrenamiento

El modelo es una conversion del Qwen3-8B original, sin modificaciones en la arquitectura ni en el proceso de entrenamiento. Qwen3-8B es un transformer causal denso con mecanismos de atencion estandar, disenado para generacion de texto autoregresiva. El equipo Firefly AI ha realizado la transformacion de pesos al formato RKNN3 para el acelerador RK1828, y tambien ha generado una version en GGUF para su uso con LlamaPi.

No se han publicado detalles sobre el dataset de entrenamiento del modelo original en la informacion proporcionada. El modelo base fue desarrollado por el equipo Qwen y su entrenamiento incluye una amplia variedad de datos multilingues. La conversion no implica entrenamiento adicional; solo se ajustan los pesos para la plataforma objetivo, lo que puede introducir perdidas de precision debidas a la cuantizacion.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno.
- Modo thinking (razonamiento interno) y modo no thinking, seleccionables segun la tarea.
- Instruccion y seguimiento de instrucciones complejas.
- Razonamiento logico y matematico basico.
- Programacion y generacion de codigo en diversos lenguajes.
- Soporte de tareas de agente, como planificacion y ejecucion de pasos.
- Multilingue: mas de 100 idiomas y dialectos segun la model card original.
- Compatible con la herramienta LlamaPi para despliegue en hardware RK1828.

## Casos de uso

- Asistentes virtuales en el borde: ejecutar un asistente conversacional local en dispositivos inteligentes, sin dependencia de la nube, aprovechando la ventana de contexto del modelo y su capacidad de dialogo.
- Generacion de codigo en entornos embebidos: utilizarlo en kits de desarrollo para generar o completar codigo en proyectos de IoT, con la ventaja de no enviar datos sensibles a servidores externos.
- Razonamiento y analisis de texto en tiempo real: procesar documentos, correos o transcripciones en un dispositivo con RK1828, con latencia baja y sin conexion a internet.
- Sistemas de soporte al cliente en el borde: desplegar un chatbot en un kiosco o terminal local que responda preguntas frecuentes, con el modelo de 8B para una comprension avanzada del lenguaje.
- Educacion y prototipado: usar el modelo en entornos academicos o de investigacion para experimentar con IA generativa en hardware de bajo coste, gracias a la licencia Apache 2.0.
- Automatizacion de tareas de texto: resumir, clasificar o extraer informacion de grandes volumenes de texto directamente en el dispositivo, reduciendo costes de ancho de banda y mejorando la privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye datos de evaluacion (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos. El rendimiento dependerá del hardware concreto (RK1828) y de la cuantizacion utilizada.

## Requisitos de hardware

- Hardware objetivo: coprocesador de IA RK1828 de Rockchip, integrado en placas como la serie AIO-GS1N2-RK182X o el AIBOX-PRO-3588, que usan un SoC RK3588 como host.
- VRAM: no aplica; el modelo se ejecuta en el NPU del RK1828, no en una GPU dedicada.
- GPU recomendadas: no se requiere GPU externa; el modelo esta optimizado para el RK1828.
- Despliegue: se usa la herramienta LlamaPi (comando `llamapi run qwen3:8b --platform rknn3/rk1828`), que gestiona la descarga y ejecucion del modelo.
- Latencia y throughput: no disponibles; dependen de la configuracion del dispositivo y de la cuantizacion exacta.

## Comparativa con modelos similares

No hay informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (por ejemplo, otras conversiones para RK1828 o modelos de 8B en formato GGUF). Los datos de rendimiento y benchmarks no estan publicados, por lo que no se puede realizar una comparacion objetiva. Se recomienda consultar la documentacion oficial de Firefly para conocer las alternativas disponibles.

## Limitaciones y advertencias

- El modelo es una conversion de Qwen3-8B y esta limitado a la plataforma RK1828; no se puede ejecutar en otros aceleradores sin una conversion adicional.
- La cuantizacion puede reducir la precision del modelo en comparacion con el original en punto flotante.
- No se proporcionan datos de latencia, throughput ni benchmarks, por lo que es necesario validar el rendimiento en el hardware objetivo antes de su uso en produccion.
- El modelo hereda las limitaciones del Qwen3-8B original: posibles sesgos en los datos de entrenamiento, riesgo de alucinaciones y dificultades en tareas de razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero los nombres y marcas de Qwen pertenecen a sus respectivos propietarios.
- El repositorio tiene pocas descargas (128) y no hay evaluaciones de la comunidad, lo que sugiere que es un proyecto joven o con adopcion limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/t-firefly/qwen3-8b-rknn3-rk1828
- Wiki de Firefly sobre RK1820/RK1828: https://wiki.t-firefly.com/en/AIO-GS1N2-RK182X/ai_rk182x.html
- Wiki de Firefly sobre AIBOX-PRO-3588: https://wiki.t-firefly.com/en/AIBOX-PRO-3588/ai.html
- RKNN3 Toolkit en GitHub: https://github.com/airockchip/rknn3-toolkit
- Documentacion de LlamaPi: https://community.t-firefly.com/docs/ai/applications/LlamaPi/llamapi
