# TattooPEEL/Chocolatine-QuebecV1

## Resumen

Chocolatine-QuebecV1 es un modelo de lenguaje conversacional de 3.821 millones de parámetros (3,8B) publicado por el usuario TattooPEEL en Hugging Face. El nombre sugiere una variante orientada a la región de Quebec (Canadá), probablemente con un ajuste fino para el francés canadiense, aunque la model card no proporciona detalles al respecto. El repositorio contiene pesos en formato GGUF, lo que indica que está preparado para inferencia eficiente en CPU y GPU mediante herramientas como llama.cpp u Ollama. La licencia MIT permite uso comercial sin restricciones significativas.

El modelo forma parte de la familia Chocolatine, una colección de modelos fine-tuneados con DPO (Direct Preference Optimization) creada por el usuario jpacifico, según se observa en la colección de Hugging Face. Sin embargo, la relación exacta entre este modelo y la colección no está documentada en la ficha. Con solo 3,8B de parámetros, se posiciona como un modelo ligero, adecuado para despliegue en entornos con recursos limitados, aunque su rendimiento en tareas complejas puede ser inferior al de modelos más grandes. La ausencia de benchmarks publicados impide una evaluación cuantitativa objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.821.079.648 (3,8B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se infiere por el tag y el tamaño del repo, pero no se especifican variantes) |
| Idiomas soportados | no disponible (el nombre sugiere frances de Quebec, sin confirmar) |
| Licencia | MIT |
| Formato de pesos | GGUF (tambien safetensors segun el dato de parametros, pero el repo parece contener GGUF) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo (tipo de transformer, numero de capas, dimensiones, etc.) ni sobre el proceso de entrenamiento. El tag "conversational" indica que fue disenado para tareas de dialogo, y el nombre "Chocolatine" sugiere que podria ser un fine-tune de un modelo base de la familia Chocolatine, que segun la coleccion de jpacifico emplea DPO (Direct Preference Optimization) para alinear el modelo con preferencias humanas. Sin embargo, no hay confirmacion de que este modelo en particular haya usado DPO. Tampoco se conocen los datos de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas como RLHF o SFT. La unica informacion tecnica disponible es el numero de parametros y el formato de pesos.

## Capacidades

- Generacion de texto conversacional: el tag "conversational" indica que el modelo esta orientado a mantener dialogos multi-turno, aunque no se especifican detalles sobre su calidad o limites.
- Compatibilidad con endpoints: el tag "endpoints_compatible" sugiere que puede desplegarse en servidores de inferencia compatibles con APIs estandar (por ejemplo, OpenAI-compatible), lo que facilita su integracion en aplicaciones.
- No se han documentado capacidades adicionales como tool calling, razonamiento avanzado, soporte de agentes, vision o audio. La ausencia de informacion impide confirmar estas funciones.

## Casos de uso

- Chatbot de atencion al cliente basico: al ser un modelo conversacional ligero, puede integrarse en sistemas de soporte para responder preguntas frecuentes o mantener conversaciones simples, siempre que el dominio este acotado y no requiera razonamiento complejo.
- Asistente virtual en frances de Quebec (si se confirma el ajuste regional): podria utilizarse en aplicaciones locales que requieran comprension del frances canadiense, aunque no hay evidencia publica de esta especializacion.
- Prototipado rapido de aplicaciones de dialogo: gracias a su tamano reducido y formato GGUF, es adecuado para pruebas de concepto en entornos de desarrollo sin grandes recursos de GPU.
- Despliegue en edge o dispositivos con poca memoria: con 3,8B de parametros y cuantizacion GGUF, puede ejecutarse en CPUs modernas o GPUs de gama baja, lo que permite aplicaciones offline.
- Filtrado o preprocesamiento de texto conversacional: podria usarse para generar respuestas preliminares o resumir conversaciones, aunque su capacidad de razonamiento es limitada.
- Educacion y experimentacion: para desarrolladores que quieran estudiar el comportamiento de modelos pequenos fine-tuneados con DPO, este modelo sirve como ejemplo, aunque sin documentacion tecnica su utilidad pedagogica es limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K u otras pruebas estandar. Tampoco se ofrecen comparaciones con modelos similares. Por tanto, no es posible evaluar su rendimiento relativo.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 3,8B en cuantizacion GGUF Q4_K_M (tipica), se necesitan aproximadamente 2,5-3 GB de VRAM. Con cuantizaciones mas agresivas (Q2, Q3) podria bajar a 2 GB, y con Q8 o FP16 superaria los 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo con cuantizacion Q4. Para mayor velocidad, una RTX 3060 o superior es suficiente.
- Compatibilidad con consumer GPU: si, cabe en la mayoria de GPUs de consumo actuales, incluso en iGPU con suficiente RAM compartida (aunque con menor rendimiento).
- Opciones de despliegue: al estar en formato GGUF, es compatible con llama.cpp, Ollama, LM Studio, text-generation-webui y servidores como llama-cpp-python. Tambien puede convertirse a otros formatos si se dispone de los safetensors originales.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (RTX 3060), un modelo de 3,8B en Q4 puede generar entre 20 y 40 tokens por segundo, dependiendo de la implementacion y el contexto. En CPU, la velocidad seria significativamente menor (5-15 tokens/s).

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa fiable. Aunque existen modelos de tamano similar (por ejemplo, Llama-3.2-3B, Qwen2.5-3B, Phi-3-mini), no se conocen los datos de rendimiento de Chocolatine-QuebecV1, ni su arquitectura base, ni su dataset de entrenamiento. Por tanto, no es posible comparar parametros, contexto o resultados. Se recomienda al lector buscar modelos con documentacion completa si necesita una evaluacion comparativa.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card solo contiene la licencia. No hay informacion sobre arquitectura, datos de entrenamiento, sesgos, limitaciones de contexto o idioma. Esto dificulta su uso en produccion con garantias.
- Riesgo de alucinacion: al ser un modelo pequeno y sin informacion sobre su entrenamiento, es probable que presente alucinaciones en temas especializados o de actualidad. No se recomienda para tareas que requieran alta precision factual.
- Sesgos desconocidos: no se han publicado evaluaciones de sesgos. El nombre "Quebec" sugiere un posible sesgo regional, pero no hay evidencia.
- Limitaciones de contexto: al no especificarse la longitud de contexto, se desconoce si puede manejar conversaciones largas. Modelos de 3,8B suelen tener contextos de 4K a 8K tokens, pero no es seguro.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificacion, pero no hay garantias de que los pesos originales (si existen safetensors) tengan la misma licencia. El repo parece contener solo GGUF, lo que limita la personalizacion.
- Produccion: sin benchmarks ni documentacion, no es aconsejable desplegarlo en entornos criticos sin una evaluacion previa exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TattooPEEL/Chocolatine-QuebecV1
- Coleccion Chocolatine de jpacifico: https://huggingface.co/collections/jpacifico/chocolatine-667595e65eaa9dd299c7f443
- Repositorio GitHub de scripts de Chocolatine: https://github.com/jpacifico/Chocolatine-LLM
- Perfil de GitHub del autor (TattooPEEL): https://github.com/tattooinmtl
