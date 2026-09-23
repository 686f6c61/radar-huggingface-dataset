# souvik-biswas/codegemma-webdev-lora

## Resumen

`souvik-biswas/codegemma-webdev-lora` es un adaptador LoRA (PEFT) publicado por el usuario souvik-biswas, obtenido mediante ajuste fino supervisado del modelo base `google/codegemma-1.1-2b` sobre un corpus denominado "vulcan". El repositorio, de 0,3 GB, contiene únicamente los pesos del adaptador en formato safetensors, no un modelo completo, por lo que su uso exige descargar y cargar por separado el modelo base de CodeGemma 1.1 de 2B parámetros. El objetivo declarado es la especialización en tareas de desarrollo web, un dominio en el que el modelo base ya parte de un entrenamiento orientado a código.

Se trata de un artefacto experimental y de escasa difusión: acumula 0 descargas y 0 likes, y su model card está generada automáticamente por el Trainer con secciones sin completar ("Model description", "Intended uses & limitations", "Training and evaluation data"). El único dato cuantitativo publicado es la pérdida de validación final (0,0283) y la tabla de pérdidas durante el entrenamiento; no hay benchmarks, ni ejemplos de uso, ni descripción del dataset "vulcan".

Su relevancia actual es, por tanto, limitada y de carácter metodológico: sirve como ejemplo reproducible de un flujo de ajuste LoRA con LLaMA-Factory sobre un modelo pequeño de la familia Gemma, y como punto de partida para quien quiera replicar o auditar el proceso. Para uso en producción no hay evidencia publicada de calidad, cobertura ni cumplimiento de licencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only del modelo base (`google/codegemma-1.1-2b`) con adaptadores LoRA de bajo rango; no se especifican rango, alpha ni módulos objetivo |
| Parámetros totales | No disponible para el adaptador. El modelo base pertenece a la familia de ~2B parámetros (dato no confirmado de forma numérica en la model card) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base `google/codegemma-1.1-2b` emplea 8.192 tokens |
| Tipos de cuantización | No disponible. Solo se publican pesos de adaptador en safetensors; no hay versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | `other` (heredada del modelo base). Uso comercial no explicitado en la model card |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; 0,3 GB en el repositorio) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo entrenado desde cero. La arquitectura subyacente es la del modelo base `google/codegemma-1.1-2b`, un transformer decoder-only de la familia Gemma especializado en código, del que el adaptador modifica un subconjunto de matrices de pesos mediante descomposición de bajo rango. La model card no indica el rango del adaptador, el valor de alpha, la tasa de dropout ni la lista de módulos sobre los que se aplica, datos imprescindibles para reproducir el ajuste.

El entrenamiento se realizó con LLaMA-Factory sobre el dataset "vulcan" (composición, tamaño y procedencia no disponibles). Los hiperparámetros documentados son: tasa de aprendizaje 0,0002 con scheduler cosine y warmup del 5 %, 3 épocas, tamaño de lote total 16 (lote por dispositivo 2, 2 dispositivos, acumulación de gradiente 4), optimizador PAGED_ADAMW_8BIT con betas (0,9 / 0,999) y epsilon 1e-08, semilla 42 y precisión mixta AMP nativa. Las versiones de framework declaradas son PEFT 0.18.1, Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 4.0.0 y Tokenizers 0.22.2.

Evolución de la pérdida publicada:

| Pérdida de entrenamiento | Época | Paso | Pérdida de validación |
|:---:|:---:|:---:|:---:|
| 0,0255 | 0,7484 | 200 | 0,0289 |
| 0,0279 | 1,4939 | 400 | 0,0286 |
| 0,0262 | 2,2395 | 600 | 0,0285 |
| 0,0260 | 2,9878 | 800 | 0,0283 |

La convergencia es plana desde el primer tercio del entrenamiento (variación de 0,0006 en validación entre el paso 200 y el 800), lo que sugiere un ajuste de escasa magnitud sobre el modelo base o un dataset poco diverso. No se documenta ningún RLHF, DPO, decodificación especulativa ni innovación técnica adicional.

## Capacidades

- Generación de texto y de código con especialización declarada en desarrollo web, aunque sin ejemplos ni evaluaciones que la respalden.
- Uso conversacional: la model card incluye la etiqueta `conversational` y el pipeline `text-generation`, por lo que se espera funcionamiento en formato de diálogo con el chat template del modelo base.
- Continuación de código (fill-in-the-middle) potencialmente heredada del modelo base CodeGemma, no confirmada para el adaptador.
- Soporte de tool calling o function calling: no documentado; no hay evidencia de que se haya entrenado para ello.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; no se declara ningún idioma y no se describe la composición lingüística del dataset "vulcan".
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponibles. El modelo base es exclusivamente de texto.

## Casos de uso

- Prototipado de autocompletado en editores: el adaptador, al ser un LoRA de 0,3 GB sobre un modelo de 2B, puede cargarse junto al modelo base en una estación de trabajo y ofrecer sugerencias de HTML, CSS y JavaScript en un IDE, siempre que la tarea se parezca al dominio del dataset de ajuste.
- Generación de componentes de interfaz a partir de descripciones textuales: útil para maquetar borradores de componentes (formularios, tarjetas, barras de navegación) que después un desarrollador revisa y corrige.
- Experimentación académica con PEFT y LLaMA-Factory: el repositorio documenta hiperparámetros y versiones completas, lo que lo convierte en un caso de estudio reproducible para comparar estrategias de ajuste LoRA sobre modelos pequeños.
- Base para ajustes posteriores: al ser un adaptador, puede servir como punto de partida incremental (por ejemplo, continuar el ajuste con datos propios) sin necesidad de reentrenar el modelo completo.
- Generación de fragmentos en entornos internos con requisitos de confidencialidad: al ejecutarse localmente en una GPU de gama media, permite mantener el código dentro de la infraestructura de la organización, sin depender de APIs externas.
- Evaluación comparativa de adaptadores: útil como referencia de base en experimentos que midan la ganancia real de un ajuste LoRA en tareas de desarrollo web frente al modelo base sin ajustar.
- Asistencia documental para equipos de desarrollo: puede redactar explicaciones breves o comentarios de código, pero sin tool calling ni acceso a documentación externa, por lo que queda limitado a conocimiento parametrizado.
- Filtrado y normalización de snippets: tareas de reescritura, formateo o conversión de estilo de código, donde el riesgo de una alucinación es bajo porque la salida se valida con linters o tests automáticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El campo `model-index` del modelo está vacío (`"results": []`) y la model card no incluye métricas de evaluación tipo MMLU, HumanEval, GSM8K ni equivalentes para el dominio web.

El único dato numérico publicado es la pérdida de validación final de 0,0283 sobre el conjunto de evaluación del propio entrenamiento, que no es comparable con benchmarks estándar ni permite inferir calidad de generación.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamaño del modelo base de ~2B parámetros, no publicadas por el autor): en bf16/fp16 en torno a 5-6 GB de pesos más caché KV; en cuantización de 8 bits en torno a 3 GB; en 4 bits en torno a 1,5-2 GB. El adaptador añade un consumo marginal (0,3 GB en disco, mucho menos en memoria al fusionarse).
- GPU recomendadas: A100, H100 o L40S para despliegue con concurrencia alta; RTX 4090, RTX 3090 o RTX 4080 para uso individual en bf16.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o cualquier GPU con 8 GB o más puede ejecutar el modelo en cuantización de 4 u 8 bits; en bf16 se recomienda un mínimo de 8-10 GB de VRAM.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM con soporte de adaptadores LoRA, TGI con adaptadores, y llama.cpp u Ollama previa fusión del adaptador con el modelo base y conversión a GGUF (no hay GGUF publicado).
- Latencia y throughput estimados: no disponibles. El autor no publica medidas de latencia, tokens por segundo ni pruebas de carga.

## Comparativa con modelos similares

Los datos de las alternativas proceden de la documentación pública de cada modelo, no de la información proporcionada sobre este adaptador. No existen benchmarks comparables porque el adaptador no publica resultados.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| souvik-biswas/codegemma-webdev-lora | Adaptador LoRA sobre base de ~2B | No disponible (base: 8.192 tokens) | `other` | 0 descargas, 0 likes | Sin benchmarks; pérdida de validación 0,0283 |
| google/codegemma-1.1-2b (base) | ~2B | 8.192 tokens | Términos de uso de Gemma | Ampliamente distribuido | Benchmarks publicados por Google en su model card |
| Qwen2.5-Coder-1.5B | 1,5B | 32.768 tokens | Apache 2.0 | Muy distribuido | Benchmarks publicados por Alibaba |
| StarCoder2-3B | 3B | 16.384 tokens | BigCode OpenRAIL-M | Muy distribuido | Benchmarks publicados en el paper de StarCoder2 |

Frente a estas alternativas, el adaptador no aporta cifras verificables: su interés diferencial se limita a la especialización declarada en desarrollo web y a la posibilidad de ejecutarse con un coste de VRAM muy bajo, no a un rendimiento medido.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento aparecen literalmente como "More information needed". No hay información sobre el dataset "vulcan": tamaño, procedencia, licencia de los datos ni idioma.
- Licencia ambigua: el campo `license: other` no concreta condiciones. Al derivar de un modelo Gemma, es previsible que se apliquen los términos de uso de Gemma, pero la model card no lo aclara ni autoriza explícitamente uso comercial. Verificar antes de cualquier despliegue productivo.
- Ausencia de validación externa: 0 descargas y 0 likes, sin terceros que hayan reproducido o evaluado el adaptador. La fecha de creación y la de actualización difieren en un minuto, lo que apunta a una publicación automatizada sin revisión manual.
- Riesgo de alucinación en código: al ser un modelo de 2B sin evaluación publicada, puede generar APIs inexistentes, imports incorrectos, selectores CSS inválidos o dependencias inventadas. Toda salida debe pasar por linters, tests o revisión humana.
- Riesgo de sobreajuste al dataset "vulcan": la pérdida de validación es prácticamente constante durante todo el entrenamiento (0,0289 a 0,0283), lo que impide descartar que el ajuste solo haya memorizado un estilo concreto de código.
- Sin soporte documentado de tool calling ni de agentes, lo que descarta su uso en pipelines que requieran invocación de funciones.
- Longitud de contexto limitada por el modelo base (8.192 tokens): insuficiente para analizar repositorios completos o ficheros muy extensos.
- Idiomas no declarados: se desconoce si el ajuste degrada el comportamiento multilingüe del modelo base.
- Sesgos: no evaluados ni documentados por el autor; al no conocerse la composición del corpus de ajuste, no se puede estimar qué sesgos técnicos, de estilo o de licencias de código se hayan podido introducir.
- Fechas de publicación futuras en los metadatos (23 de septiembre de 2026), lo que dificulta situar el artefacto en una línea temporal fiable de versiones del ecosistema.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/souvik-biswas/codegemma-webdev-lora
- Modelo base: https://huggingface.co/google/codegemma-1.1-2b
- Repositorio de LLaMA-Factory (herramienta de ajuste indicada en las etiquetas): https://github.com/hiyouga/LLaMA-Factory
- Librería PEFT: https://github.com/huggingface/peft

No se han proporcionado otros enlaces (papers, blogs, demos o repositorios adicionales) en la información disponible.
