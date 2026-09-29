# yunusemrejr/GemmaClaim-270M

## Resumen

GemmaClaim-270M es un ajuste fino del modelo base google/gemma-3-270m, publicado por el usuario yunusemrejr en Hugging Face. Se trata de un analizador de afirmaciones ("claim analyzer") especializado de forma agresiva y restringido al ingles: su funcion es descomponer una afirmacion en un analisis estructurado que incluye tipo de afirmacion, premisas, supuestos ocultos, factores de confusion y condiciones de falsacion, entre otros campos. El modelo rechaza explicitamente entradas que no esten en ingles y tareas ajenas al analisis de afirmaciones.

El modelo cuenta con 268.098.176 parametros totales, hereda la arquitectura y la licencia Gemma del modelo base de Google y se distribuye en dos formatos: pesos en safetensors (bf16) y una cuantizacion GGUF Q4_K_M orientada a inferencia local en navegador mediante wllama con WebGPU y respaldo WASM. El repositorio ocupa aproximadamente 0,8 GB e incluye los pesos fusionados, un adaptador LoRA de segunda etapa, la cuantizacion GGUF y los resultados de evaluacion en un conjunto reservado.

Su relevancia radica en que demuestra un flujo de trabajo de especializacion estrecha sobre un modelo de muy bajo coste computacional (270M de parametros), con entrenamiento negativo para el rechazo y despliegue pensado para ejecucion en dispositivo o en navegador. El modelo esta etiquetado con 0 descargas y 1 like en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Google Gemma 3 270M) |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M; pesos completos en bf16 |
| Idiomas soportados | ingles (el modelo rechaza entradas en otros idiomas) |
| Licencia | gemma |
| Formato de pesos | safetensors (bf16, carpeta `merged/`) y GGUF (Q4_K_M, carpeta `gguf/`) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-3-270m, un transformer decoder-only de la familia Gemma 3. No se especifican en la informacion disponible cambios en la arquitectura base, por lo que se asume que conserva la estructura del modelo original. El autor indica que el entrenamiento se realizo en dos etapas: un SFT de parametros completos (etapa 1) seguido de un ajuste con LoRA (etapa 2) sobre un conjunto de datos sintetico de analisis de afirmaciones, con un volumen extenso de ejemplos negativos orientados al rechazo de peticiones fuera de dominio.

La model card describe que los pesos finales en `merged/` corresponden a la mejor variante entre el SFT completo y el SFT+LoRA segun el conjunto de test congelado, y que el adaptador LoRA de etapa 2 se aplica sobre la exportacion del SFT de etapa 1. El repositorio incluye tambien la carpeta `eval/` con resultados de evaluacion en un conjunto reservado, comparando el modelo base, el modelo con SFT completo y la version fusionada, aunque los valores numericos no se detallan en la informacion proporcionada. No se menciona uso de RLHF ni DPO. El formato de prompt es compacto y no incluye instrucciones largas:

```
Analyze this claim.

INPUT:
<your claim>

ANALYSIS:
```

La decodificacion recomendada es greedy (temperature 0) con parada en EOS.

## Capacidades

- Analisis estructurado de afirmaciones: descompone una afirmacion en tipo, premisas, supuestos ocultos, factores de confusion y condiciones de falsacion.
- Generacion de texto especializada: responde con el formato de analisis esperado para el dominio de claim analysis.
- Rechazo de dominio: ha sido entrenado con ejemplos negativos para rechazar tareas no relacionadas con el analisis de afirmaciones.
- Restriccion de idioma: rechaza entradas que no esten en ingles.
- Razonamiento acotado al dominio: la etiqueta `reasoning` indica capacidad de descomposicion logica, limitada al caso de uso de analisis de afirmaciones.
- Inferencia local en navegador: la cuantizacion Q4_K_M esta preparada para wllama con WebGPU y respaldo WASM.
- Tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning general: no disponible.
- Capacidades multilingues: no, el modelo es explicitamente solo en ingles.
- Vision, audio o thinking mode: no disponible.

## Casos de uso

- Analisis de desinformacion: dado un enunciado procedente de redes sociales o prensa, el modelo genera una lista de premisas implicitas y factores de confusion, lo que permite a un equipo de verificacion priorizar que afirmaciones requieren comprobacion documental.
- Asistencia a fact-checkers: el campo de condiciones de falsacion produce explicitamente que evidencia refutaria la afirmacion, acelerando la busqueda de fuentes por parte del verificador.
- Educacion en pensamiento critico: el modelo puede usarse en un cuaderno interactivo o aplicacion web para que estudiantes diseccionen afirmaciones y detecten supuestos no declarados.
- Filtrado previo en pipelines de moderacion: al rechazar entradas fuera de dominio y no inglesas, puede actuar como primer clasificador que derive solo afirmaciones relevantes a un sistema de revision humano.
- Inferencia en navegador sin backend: la cuantizacion Q4_K_M y el soporte de wllama permiten ejecutar el analisis completamente en el cliente mediante WebGPU, sin enviar el texto a un servidor.
- Procesamiento por lotes de bajo coste: con 268M de parametros, se puede ejecutar sobre CPU o GPU consumer para analizar grandes volumenes de afirmaciones con un coste energetico y economico minimo.
- Prototipado de agentes de analisis: sirve como componente especializado dentro de una arquitectura mayor, encargado unicamente de la fase de descomposicion de afirmaciones antes de pasar a un modelo mayor de sintesis.
- Evaluacion de tecnicas de especializacion: al publicar pesos fusionados, adaptador LoRA y resultados de evaluacion, el repositorio sirve de referencia para estudiar el efecto del SFT completo frente al ajuste con LoRA en modelos muy pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de una carpeta `eval/` con resultados en un conjunto reservado que compara el modelo base, el SFT completo y la version fusionada, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K ni otros). El unico dato de rendimiento indirecto es la referencia del blog de Google a la mejora en IFEval del modelo base Gemma 3 270M, sin valores numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 0,54 GB solo para pesos (268,1M de parametros a 2 bytes por parametro), mas activaciones y cache KV.
- VRAM estimada en Q4_K_M: en torno a 0,15-0,20 GB para pesos, apto para ejecucion en memoria unificada de dispositivos moviles y navegadores.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Se puede ejecutar en RTX 3060, RTX 4090 o integradas con suficiente memoria compartida.
- Cabe en consumer GPU: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Cabe en dispositivos de borde: si, el propio autor distribuye la cuantizacion GGUF para inferencia en navegador con WebGPU y WASM, lo que apunta a ejecucion en dispositivo.
- Opciones de despliegue: llama.cpp y sus derivados (Ollama) para el formato GGUF; wllama para navegador; vLLM o TGI para servir los pesos en safetensors; transformers para uso directo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| yunusemrejr/GemmaClaim-270M | 268.098.176 | no disponible | gemma | Analisis de afirmaciones (solo ingles) | safetensors + GGUF |
| google/gemma-3-270m | 270M (aprox., segun denominacion) | no disponible | gemma | Modelo base de proposito general | safetensors |
| google/gemma-3-270m-it | no disponible | no disponible | gemma | Instrucciones de proposito general | safetensors |

El modelo es una derivacion directa de google/gemma-3-270m, por lo que la comparacion principal es contra su propio modelo base: GemmaClaim-270M sacrifica la generalidad y el multilingueismo del base a cambio de un comportamiento muy especializado y con rechazo de dominio. No se dispone de datos de rendimiento comparativo que permitan establecer una jerarquia cuantitativa entre ellos.

## Limitaciones y advertencias

- Idioma: el modelo funciona unicamente en ingles y rechaza explicitamente entradas en otros idiomas, incluido el castellano.
- Dominio muy restringido: fuera del analisis de afirmaciones, el modelo esta entrenado para rechazar la peticion, por lo que no sirve como asistente general.
- Riesgo de alucinacion: al ser un modelo de 270M de parametros entrenado sobre datos sinteticos, la generacion de premisas, supuestos o condiciones de falsacion puede ser plausible pero incorrecta; el analisis debe tratarse como material de apoyo, no como verificacion factual.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse solo en ingles y sobre un dataset sintetico, puede heredar sesgos del modelo base y del generador de datos. No hay informacion disponible sobre la composicion del dataset.
- Sobreajuste al formato: el modelo espera un formato de prompt compacto y concreto y una decodificacion greedy; desviarse del formato puede degradar la calidad de la respuesta.
- Procedencia y trazabilidad: el modelo base indicado es google/gemma-3-270m, pero no se incluye informacion sobre el autor del ajuste ni sobre el proceso de validacion de la carpeta `eval/`.
- Datos de adopcion: 0 descargas y 1 like en el momento de la consulta, lo que limita la evidencia de uso en produccion por terceros.
- Restricciones de licencia: el modelo se distribuye bajo la licencia Gemma de Google, que impone condiciones de uso (incluidas clausulas de uso prohibido y obligaciones de atribucion y de redistribucion). Es necesario revisar los terminos de la licencia Gemma antes de un uso comercial.
- Fecha de creacion registrada: 2026-09-28, dato que conviene verificar por su inconsistencia con el calendario habitual.
- No se especifican longitudes de contexto, tipos de cuantizacion adicionales ni latencias medidas, lo que dificulta el dimensionamiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunusemrejr/GemmaClaim-270M
- Modelo base: https://huggingface.co/google/gemma-3-270m
- Anuncio de Gemma 3 270M en el blog de Google for Developers: https://developers.googleblog.com/en/introducing-gemma-3-270m/
- Cobertura de Gemma 3 270M en DeepNewz: https://deepnewz.com/ai-modeling/google-unveils-gemma-3-270m-model-energy-efficient-on-device-ai-0de307b2
- Cobertura de Gemma 3 270M en AIsckool: https://aisckool.com/we-present-gemma-3-270m-model-for-hyper-product-ai/
- Repositorio de GitHub con el generador del dataset, scripts de entrenamiento, entorno de evaluacion y aplicacion de navegador: mencionado en la model card, URL no proporcionada
