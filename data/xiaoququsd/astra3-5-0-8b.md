# xiaoququsd/astra3.5-0.8b

## Resumen

Astra3.5-0.8b es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario xiaoququsd sobre el modelo base Qwen/Qwen3.5-0.8B. Su propósito es muy específico y acotado: modificar la distribución de dígitos que genera el modelo cuando se le pide escribir secuencias de enteros aleatorios entre 1 y 355, de modo que dicha distribución se aproxime a la del modelo propietario `gpt-6.2-astra` en pruebas de "huella digital numérica" (fingerprinting). No se trata, por tanto, de un modelo de propósito general, sino de una herramienta de investigación orientada a estudiar y replicar patrones de muestreo característicos.

El adaptador se entrenó en dos fases: primero un ajuste supervisado (SFT) sobre 176 respuestas de Astra durante 3 rondas, y después un entrenamiento con GRPO (Group Relative Policy Optimization). La configuración LoRA emplea r=16 y alpha=32. El autor declara explícitamente que el resultado "no es Astra y no tiene las capacidades de Astra", y que su uso es exclusivamente de investigación.

La relevancia de esta ficha es doble: por un lado, documenta un caso concreto de adaptación paramétricamente eficiente sobre un modelo pequeño (0,8B) con licencia Apache 2.0; por otro, ilustra una técnica emergente de análisis de modelos (los tests de huella numérica) y sus riesgos, como el sobreajuste al detector que actúa como recompensa del GRPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen3.5-0.8B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 0,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-0.8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | chino (zh), ingles (en), japones (ja), coreano (ko), frances (fr) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |
| Rango LoRA (r) | 16 |
| Alpha LoRA | 32 |
| Tamano del repositorio | 0,2 GB |
| Libreria | peft |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.5-0.8B, un transformer decoder-only del que no se detallan en la informacion disponible ni el numero exacto de tokens de entrenamiento ni la composicion del dataset base. La innovacion reside en el procedimiento de ajuste: una primera fase de SFT con 176 respuestas de `gpt-6.2-astra` durante 3 rondas, seguida de una fase de GRPO (Group Relative Policy Optimization) cuyo reward es un detector de huella numérica denominado `lmfpd`. La configuracion LoRA es r=16 y alpha=32.

El repositorio incluye varias versiones: `sft`, la version por defecto (GRPO primera ronda, step-25) en la raiz, y `rl-r2-step-25`, `rl-r2-step-50` y `rl-r2-step-75` en subdirectorios. Segun la model card, las versiones de segunda ronda de GRPO alcanzan una confianza de deteccion de 1.000 en el test de tres respuestas agrupadas, frente a 0.882 del Astra real de referencia. El autor advierte que el detector `lmfpd` es a la vez el reward del GRPO, por lo que las metricas no constituyen evidencia independiente, y que la segunda ronda supera el margen del Astra real, con indicios de sobreajuste al detector (25 de 30 respuestas de `step-75` empiezan por 247, frente a 8 de 30 en el Astra real).

## Capacidades

- Generacion de texto en modo no-thinking (la model card indica que las preguntas deben formularse en modo sin razonamiento).
- Reproduccion de la distribucion de digitos de `gpt-6.2-astra` en tareas de escritura de enteros aleatorios entre 1 y 355.
- Capacidades multilingues heredadas del modelo base: chino, ingles, japones, coreano y frances.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta vision, audio ni otras modalidades.
- No dispone de las capacidades del modelo Astra original; el autor lo desmiente explicitamente.

## Casos de uso

- Investigacion sobre huellas digitales de modelos: el adaptador permite estudiar si es posible replicar el patron de muestreo numerico de un modelo propietario mediante un ajuste LoRA de bajo rango sobre un modelo abierto pequeno.
- Analisis de sobreajuste a detectores: las distintas versiones del repositorio (`sft`, `rl-r2-step-25/50/75`) permiten comparar como evoluciona la metrica del detector a medida que avanza el GRPO, util para estudiar el fenomeno de reward hacking.
- Experimentos de alineacion con GRPO: sirve como caso de referencia de un pipeline SFT + GRPO con un reward automatico y un modelo base de 0,8B, replicable en entornos con recursos limitados.
- Docencia y divulgacion: ejemplo concreto y reproducible de adaptacion PEFT con `peft` y `transformers`, con codigo de inferencia incluido en la model card.
- Pruebas de deteccion de contenido sintetico: el propio detector `lmfpd` y las versiones del adaptador pueden usarse como material de calibracion en estudios de atribucion de texto generado.
- Evaluacion de robustez de clasificadores: las diferencias entre versiones (por ejemplo, el sesgo hacia el prefijo 247 en `step-75`) permiten construir conjuntos de prueba adversarios para detectores de autoría.

## Benchmarks y rendimiento

Los datos disponibles no son benchmarks estandar (MMLU, HumanEval, GSM8K), sino metricas internas de deteccion de huella numerica sobre 30 preguntas de retencion, temperatura 1, una respuesta por pregunta.

| Version | Juzgada como Astra (1 respuesta) | Grupo de 3 | Confianza minima (grupo de 3) | Diferencia mediana | Cumplimiento de cantidad | Dentro del 5% | Repeticiones (mediana) |
|---|---|---|---|---|---|---|---|
| Astra real (control) | 25/30 | 10/10 | 0.882 | 1.43 | 1.00 | 30/30 | 6 |
| SFT | 28/30 | 10/10 | 0.782 | 0.60 | 0.56–1.40 | 6/30 | 27 |
| GRPO ronda 1 step-25 (por defecto) | 30/30 | 10/10 | 0.996 | 1.37 | 0.74–1.45 | 4/30 | 28 |
| GRPO ronda 2 step-25 | 30/30 | 10/10 | 1.000 | 1.76 | 0.88–1.30 | 7/30 | 49.5 |
| GRPO ronda 2 step-50 | 30/30 | 10/10 | 1.000 | 1.99 | 0.84–1.17 | 7/30 | 39 |
| GRPO ronda 2 step-75 | 30/30 | 10/10 | 1.000 | 2.42 | 0.89–1.19 | 12/30 | 28 |

El autor advierte que el detector `lmfpd` es el mismo reward del GRPO y que no se ha probado en el sitio real, por lo que estos resultados no deben interpretarse como validacion independiente. No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,2 GB; el modelo base Qwen3.5-0.8B debe cargarse por separado.
- VRAM estimada para inferencia: no disponible de forma explicita; para un modelo de 0,8B en precision completa se situa en el rango de 2 GB, y en cuantizaciones de 4 bits puede reducirse por debajo de 1 GB, aunque estos valores no se confirman en la informacion proporcionada.
- GPU recomendadas: no disponible. Por tamano, el modelo base cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no se documenta oficialmente.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del modelo base, aunque no se confirma.
- Opciones de despliegue: la model card solo documenta `peft` + `transformers` con `PeftModel.from_pretrained`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un adaptador LoRA de proposito muy especifico (huella numerica) sin equivalentes publicos conocidos en la informacion disponible.

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| astra3.5-0.8b | adaptador sobre 0,8B | no disponible | replicar huella numerica de Astra | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8B | no disponible | generacion de texto general | no disponible en esta ficha | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no es Astra y no tiene sus capacidades; no debe presentarse como tal.
- Uso previsto exclusivamente de investigacion.
- El detector `lmfpd` es el mismo reward del GRPO, por lo que las metricas de la model card estan sesgadas y no constituyen evidencia independiente.
- No se ha probado en el sitio o servicio real de Astra.
- La segunda ronda de GRPO supera el margen del Astra real, con indicios de sobreajuste al detector; `step-75` empieza por 247 en 25 de 30 casos (frente a 8 de 30 del Astra real).
- Debilidad conocida: el modelo no cuenta correctamente la cantidad de numeros solicitada (cumplimiento entre 0,74 y 1,45 en la version por defecto) y produce un numero elevado de digitos repetidos (mediana de 28 frente a 6 del Astra real).
- Las preguntas deben formularse en modo no-thinking; no se documenta el comportamiento en modo thinking.
- Riesgo de alucinacion y de sesgos: no evaluado en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial del adaptador, pero el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse por separado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/xiaoququsd/astra3.5-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
