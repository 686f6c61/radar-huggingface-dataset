# Thox-ai/ThoxMini-3B

## Resumen

ThoxMini-3B es un ajuste fino mediante LoRA (rango 16) del modelo meta-llama/Llama-3.2-3B-Instruct, desarrollado por Thox-ai (THOX.ai). El modelo se publica como adaptador PEFT en safetensors junto con una conversión GGUF en cuantización Q4_K_M dentro del mismo repositorio, de forma que la build ejecutable se distribuye sin pasos adicionales de conversión. El corpus de entrenamiento lo compone el propio autor: 1.565 ejemplos de instrucción de autoría THOX orientados al nivel "ThoxMini" de su línea de dispositivos.

El modelo resuelve el caso de uso de un asistente conversacional ligero y local-first: al estar construido sobre Llama-3.2-3B-Instruct, hereda una arquitectura transformer densa de 3.212.749.888 parámetros y está pensado para ejecutarse en hardware de consumo o dispositivos edge. La relevancia actual radica en su doble formato de distribución (adaptador más GGUF) y en su disponibilidad pública sin gating, lo que simplifica la evaluación y el despliegue en entornos con recursos limitados.

La ficha se basa exclusivamente en la información publicada en Hugging Face, la model card y la página de Ollama. No se han publicado resultados de benchmarks ni detalles sobre el dataset de entrenamiento más allá del recuento de ejemplos, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (Llama 3.2), ajuste fino LoRA de rango 16 sobre meta-llama/Llama-3.2-3B-Instruct |
| Parametros totales | 3.212.749.888 (modelo base); adaptador LoRA de 97.307.544 B |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | Q4_K_M (GGUF incluido); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | en (ingles) |
| Licencia | Llama 3.2 Community License (Copyright © Meta Platforms, Inc.), sujeto a la Acceptable Use Policy |
| Formato de pesos | safetensors (adaptador PEFT), GGUF Q4_K_M, tokenizer.json, tokenizer_config.json, adapter_config.json, chat_template.jinja |

## Arquitectura y entrenamiento

El modelo parte de Llama-3.2-3B-Instruct, un transformer denso de Meta, y aplica sobre él un ajuste fino supervisado (SFT) mediante LoRA de rango 16. El resultado se publica como adaptador PEFT: el repositorio contiene `adapter_model.safetensors` (97 MB) y `adapter_config.json`, de modo que el adaptador debe cargarse sobre el modelo base con Transformers y PEFT. No se especifica en la información disponible la composición exacta del corpus, la longitud de las secuencias de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO.

La innovación práctica del paquete no está en la arquitectura, sino en el empaquetado: el autor incluye en el mismo repositorio la conversión GGUF en Q4_K_M (`thoxmini-3b-Q4_K_M.gguf`, 2.019.373.952 B), lo que permite ejecutar el modelo con llama.cpp u Ollama sin realizar la conversión desde el adaptador. El chat template se distribuye como `chat_template.jinja`. No se documentan técnicas como decodificación especulativa, atención lineal ni arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Llama-3.2-3B-Instruct.
- Ajuste orientado a instrucciones mediante SFT sobre 1.565 ejemplos de autoría THOX, con el objetivo declarado de actuar como asistente del nivel ThoxMini.
- Ejecución local y on-device gracias al formato GGUF Q4_K_M y a los 3B parámetros del modelo base.
- Dos rutas de carga: adaptador PEFT con Transformers o GGUF con Ollama, llama.cpp o Llama.
- Tool calling / function calling: no documentado en la información disponible (el modelo base Llama-3.2-3B-Instruct lo soporta, pero el autor no lo declara para este ajuste).
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es únicamente de texto.
- Modo thinking explícito: no disponible.

## Casos de uso

- Asistente conversacional local en dispositivos de gama baja: el GGUF Q4_K_M de aproximadamente 2 GB permite ejecutar el modelo en portátiles sin GPU dedicada mediante Ollama o llama.cpp, con la ventaja de que los datos no salen del dispositivo.
- Prototipado rápido de asistentes personalizados: al cargar el adaptador sobre Llama-3.2-3B-Instruct con Transformers y PEFT, un equipo puede evaluar el efecto del ajuste THOX sin reentrenar ni convertir pesos.
- Integración en aplicaciones de escritorio o herramientas CLI: el modelo cabe en el flujo de distribución de una app local y responde en inglés, lo que encaja en asistentes de productividad embebidos.
- Evaluación comparativa de adaptadores LoRA: sirve como caso de estudio de un ajuste de rango 16 sobre un corpus pequeño (1.565 ejemplos) frente al modelo base, útil para investigar el impacto de SFT de bajo coste.
- Despliegue en entornos con recursos restringidos o air-gapped: la distribución en un único repositorio con pesos y tokenizer simplifica la instalación sin acceso a servicios en la nube.
- Base para ajustes posteriores: el adaptador puede combinarse o sustituirse por otros adaptadores PEFT sobre el mismo modelo base, lo que facilita experimentación en pipelines de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en Q4_K_M: en torno a 2,5-3 GB (el fichero GGUF ocupa 2,02 GB y hay que sumar el contexto y el overhead del runtime); estimación orientativa, no publicada por el autor.
- VRAM estimada con el adaptador en precisión nativa (fp16/bf16): aproximadamente 6-7 GB para los pesos del modelo base de 3B más el adaptador.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M (por ejemplo, GTX 1650, RTX 3050, RTX 4060); para fp16 se recomienda RTX 3060 de 12 GB o superior. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, aunque funcionarían.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 4 GB o más usando la cuantización Q4_K_M; también es viable en CPU.
- Opciones de despliegue: Ollama (`ollama pull Thox-ai/thoxmini-3b`), llama.cpp con el GGUF, y Transformers + PEFT con el adaptador sobre el modelo base. vLLM y TGI son compatibles con el modelo base, pero el autor no documenta su uso con este adaptador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThoxMini-3B | 3,2B (adaptador LoRA sobre Llama-3.2-3B-Instruct) | no disponible | Llama 3.2 Community | safetensors (adapter) + GGUF Q4_K_M | Ajuste SFT sobre 1.565 ejemplos; idioma inglés |
| meta-llama/Llama-3.2-3B-Instruct | 3,2B | no disponible en esta ficha | Llama 3.2 Community | safetensors, GGUF (comunidad) | Modelo base sin ajuste THOX; referencia directa |
| ThoxMini-Phi4Mini | no disponible | no disponible | no disponible | no disponible | Citado por el autor como el modelo insignia del mismo nivel ThoxMini; sin datos técnicos en la información disponible |
| Qwen2.5-3B-Instruct | 3B | no disponible en esta ficha | Apache 2.0 (según el modelo original) | safetensors, GGUF | Alternativa de tamaño similar con licencia permisiva; no evaluada frente a ThoxMini-3B |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (1.565 ejemplos), lo que limita la profundidad del ajuste y aumenta el riesgo de sobreajuste al estilo y contenido de esos ejemplos.
- Idioma: el modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación inherente a un modelo de 3B parámetros, agravado por la falta de benchmarks publicados que permitan calibrar su fiabilidad.
- Licencia Llama 3.2 Community: el uso comercial está permitido con condiciones (incluida la política de uso aceptable y los requisitos de atribución "Built with Llama"); es necesario revisar los términos antes de desplegar en producción.
- El adaptador requiere el modelo base meta-llama/Llama-3.2-3B-Instruct, que debe descargarse por separado y aceptar sus condiciones de acceso.
- No se documentan evaluaciones de sesgo, seguridad ni robustez frente a prompts adversarios.
- Tool calling, agentes y razonamiento multi-paso no están declarados por el autor; no deben asumirse en producción sin validación previa.
- La model card incluye notas editoriales del fundador y de la CAO de THOX.ai que no constituyen especificaciones técnicas y no deben interpretarse como garantías de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxMini-3B
- Página en Ollama: https://ollama.com/Thox-ai/thoxmini-3b
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso aceptable de Llama 3.2: https://www.llama.com/llama3_2/use-policy/
