# Srijan-Srivastava/Valentine-v0

## Resumen

Valentine-v0 es un modelo de lenguaje experimental de muy pequeño tamaño desarrollado por Srijan-Srivastava. Se trata de una prueba temprana de una nueva arquitectura denominada "Valentine", cuyo autor planea publicar posteriormente una versión más grande entrenada sobre Fineweb-edu junto con un informe técnico. El modelo está diseñado para generar texto en inglés, concretamente correos electrónicos, y ha sido entrenado sobre el dataset `Kamisori-daijin/email-datasets-20k`.

Arquitectónicamente sigue una estructura tipo transformer (similar a GPT-2 o GPT-3, según las etiquetas del repositorio), con 2 capas, 4 cabezas de atención y una dimensión de cabeza de 64. El modelo tiene un total de 546.048 parámetros, de los cuales solo 21.760 son parámetros no asociados a embeddings. La longitud de contexto no se ha publicado. Su relevancia actual es principalmente académica o experimental, como punto de partida para investigar arquitecturas alternativas de modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (tipo GPT-2/GPT-3, segun etiquetas del repositorio) |
| Parametros totales | 546.048 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | binario (model.bin) |

## Arquitectura y entrenamiento

El modelo es un transformer de tamaño mínimo: 2 capas, 4 cabezas de atención y una dimensión de cabeza de 64. Según el autor, la arquitectura recibe el nombre de "Valentine" y es una propuesta experimental, aunque no se han publicado detalles técnicos sobre las innovaciones que introduce. El entrenamiento se realizó sobre el dataset `Kamisori-daijin/email-datasets-20k`, compuesto por correos electrónicos en inglés. No hay información sobre el número total de tokens ni sobre la composición exacta del dataset.

Los valores de pérdida finales reportados son 2.1670 para entrenamiento y 2.2646 para validación. No se menciona ningún proceso de RLHF, DPO ni otras técnicas de alineamiento. El repositorio incluye un archivo `out.txt` con los registros completos de entrenamiento y la configuración utilizada.

## Capacidades

- Generacion de texto en ingles, especializada en el dominio de correos electronicos (business emails, refusal emails, etc.).
- El modelo puede completar prompts como "Write a" o secuencias con tokens de control de actor (`<|actor|>user<|end-text|>` y `<|actor|>model<|end-text|>`), lo que sugiere un formato de conversacion o de instruccion.
- No se ha documentado soporte de tool calling, function calling ni integracion con agentes.
- No hay evidencia de capacidades multilingues; el idioma soportado es exclusivamente ingles.
- No dispone de modo de razonamiento explicito, vision ni audio.

## Casos de uso

- Investigacion educativa sobre arquitecturas de lenguaje: el modelo es util para estudiar el comportamiento de transformers extremadamente pequenos, analizar perdidas de entrenamiento y validacion, y comparar configuraciones de hiperparametros.
- Prototipado rapido de generacion de correos: puede usarse para generar borradores de emails en ingles, aunque la calidad es limitada y requiere revision humana.
- Experimentacion con tokenizacion y formatos de prompt: los tokens de actor permiten probar patrones de conversacion en modelos minimos.
- Pruebas de inferencia en entornos con recursos minimos: al tener menos de un millon de parametros, se puede ejecutar en CPU sin necesidad de GPU.
- Depuracion de pipelines de entrenamiento: el archivo `out.txt` con registros y configuracion sirve como referencia para depurar flujos de entrenamiento de modelos pequenos.
- Generacion de plantillas de correo en ingles: el modelo puede producir estructuras de correo (saludo, cuerpo, despedida) aunque con incoherencias frecuentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo reportado es la perdida final de entrenamiento y validacion: 2.1670 y 2.2646 respectivamente, que no constituyen una evaluacion estandar comparable con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB, dado el tamano del modelo (546.048 parametros). Es probable que funcione en CPU sin necesidad de GPU.
- GPU recomendadas: no se requiere ninguna GPU especifica; cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: si, cualquier GPU consumer (por ejemplo, una RTX 3060 o inferior) ejecutara el modelo sin problemas.
- Opciones de despliegue: el repositorio incluye un script `inference.py` que se ejecuta con `uv run`, lo que permite inferencia directa desde la linea de comandos. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de modelos comparables de la misma categoria en la informacion proporcionada. El modelo es un experimento de menos de un millon de parametros, por lo que cualquier comparacion con modelos como GPT-2 (124M) o nanoGPT seria desproporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo experimental y de tamano extremadamente reducido, por lo que su capacidad de razonamiento y coherencia es muy limitada.
- Riesgo alto de alucinacion y generacion de texto incoherente, como se observa en los ejemplos de salida.
- Solo soporta ingles y esta especializado en correos electronicos; no es util para otros dominios ni idiomas.
- No se ha documentado la longitud de contexto, por lo que no es fiable para conversaciones largas o documentos extensos.
- No dispone de soporte para tool calling, function calling ni agentes, lo que limita su uso en produccion.
- Al ser un experimento temprano, el autor advierte que una version mayor y un informe tecnico estan por publicarse; el modelo actual no debe considerarse estable.
- La licencia MIT permite uso comercial, pero la calidad del modelo hace inviable cualquier aplicacion real sin una revision exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Srijan-Srivastava/Valentine-v0
- Perfil del autor: https://huggingface.co/Srijan-Srivastava
- Dataset de entrenamiento: https://huggingface.co/datasets/Kamisori-daijin/email-datasets-20k
