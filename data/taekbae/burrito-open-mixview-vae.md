# taekbae/burrito-open-mixview-vae

## Resumen

Burrito (open layout) mixed-view partner VAEs es un conjunto de tres modelos generativos de comportamiento de companero (partner-behaviour VAEs) desarrollados por el usuario taekbae para el entorno de cocina multiagente Burrito, en su variante `open` con observabilidad parcial (`agent_view_size=3`). No se trata de un modelo de lenguaje: son tres autoencoders variacionales (VAE) convolucionales-recurrentes que modelan la politica de un agente companero y se usan como generador de comportamiento sintetico durante el entrenamiento de agentes en escenarios de coordinacion zero-shot.

Cada variante se diferencia en como se construye la entrada del encoder (24 canales) y del decoder (12 canales), y en si se mezcla la vista `union` (observacion del companero con celdas rellenadas desde el otro agente) con la vista `po_partner` (observacion parcial estricta del agente modelado). La generacion utiliza exclusivamente el decoder, alimentado con la observacion parcial del companero y un vector latente `z` de 16 dimensiones muestreado de una normal estandar, produciendo 28 acciones discretas.

El interes del modelo reside en su enfoque: entrena un generador de politicas de companero estrictamente parcialmente observante sin etapa de destilacion, lo que permite a un agente aprender a coordinarse con companeros que no ven el estado completo del entorno. Es relevante para investigacion en multi-agent reinforcement learning (MARL) y coordinacion zero-shot, no para tareas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE con encoder CNN+GRU y decoder CNN+GRU (capas CNN 32/64/32 canales, kernel 3; GRU de 256 unidades ocultas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; procesa chunks de 200 pasos |
| Tipos de cuantizacion | no disponible (pesos en PyTorch `state_dict` de precision estandar) |
| Idiomas soportados | no aplica (modelo de control, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`.pt`), cargables con `torch.load(..., weights_only=True)`) |
| Dimension latente | 16 |
| Entrada del decoder | 7x10x12 (observacion parcial del companero) + `z` (16) |
| Salida del decoder | 28 acciones discretas |
| Entrada del encoder | 7x10x24 + embeddings de accion (`nn.Embedding(28, 8)`) |
| Espacio de observacion | 7x10x12; celdas fuera de vista marcadas con -2 |

## Arquitectura y entrenamiento

El modelo es un VAE condicional de secuencia. El encoder procesa la observacion de 24 canales (union concatenada con `po_partner`, o una mezcla Bernoulli entre ambas segun variante) junto con embeddings de accion de dimension 8, y produce una Gaussiana heterocedastica dependiente de la entrada para `q(z)` con `z_dim=16`. El decoder recibe la observacion parcial de 12 canales y `z`, y genera 28 acciones discretas a traves de tres capas convolucionales (32, 64 y 32 canales, kernel 3, stride 1, padding 1) seguidas de una GRU de 256 unidades ocultas. La vista se fija dentro de cada chunk de 200 pasos, de modo que encoder y decoder son GRUs que operan sobre la secuencia del chunk.

El entrenamiento usa chunks de 200 pasos con la perdida `-(sum_t log p(a_t | dec_input_t, z) - 0.1 * KL(q(z | enc_input, a) || N(0, I)))`, con `z` muestreado de la posterior en el ultimo paso del chunk y compartido por todos los pasos. Se emplea batch de 256 chunks, 6 chunks por episodio de 2400 pasos, ambos agentes como companero modelado, Adam con weight decay 1e-4, 500 epocas y semilla 1. El checkpoint se selecciona como el de mejor log-verosimilitud de validacion entre las epocas con KL de validacion inferior a 100. Las tres variantes (`b`, `c`, `c_dec`) se diferencian en la construccion de la vista de entrada del encoder y del decoder: `b` usa siempre `union`; `c` mezcla Bernoulli(0.5) por chunk en el encoder; `c_dec` comparte una unica vista Bernoulli(0.5) entre encoder y decoder. En generacion, las tres reciben `po_partner` en el decoder, garantizando que el companero generado es estrictamente parcialmente observante.

## Capacidades

- Generacion de trayectorias de accion de un companero en el entorno Burrito (layout `open`), condicionadas a su observacion parcial de 7x10x12.
- Modelado de politicas de companero con observabilidad parcial estricta, sin acceso al estado completo.
- Generacion estocastica mediante muestreo de `z ~ N(0, I)` (16 dimensiones), lo que permite diversidad de comportamientos.
- Produccion de 28 acciones discretas por paso a lo largo de chunks de 200 pasos con coherencia temporal (GRU).
- Integracion en pipelines de entrenamiento MARL estilo MAPBT/GOAT mediante `--vae_model_dir` y `--vae_encoder_input partner_obs --vae_hidden_size 256`.
- No soporta tool calling, function calling, agentes LLM, razonamiento en lenguaje natural, vision general, audio ni capacidades multilingues.

## Casos de uso

- Entrenamiento de agentes en MARL con companeros sinteticos: se usa `decoder.pt` como generador de politica de companero durante el entrenamiento de un agente principal en el entorno Burrito `open`, permitiendo exponer al agente a una distribucion amplia de comportamientos de companero sin necesidad de recolectar rollouts reales.
- Investigacion en coordinacion zero-shot: las tres variantes permiten estudiar el efecto de la informacion privilegiada (`union`) frente a la observacion parcial estricta (`po_partner`) en la capacidad de coordinacion del agente aprendido.
- Ablacion de diseno de VAEs de companero: comparar `b`, `c` y `c_dec` aisla el impacto de mezclar vistas en el encoder y en el decoder sobre la log-verosimilitud y la precision de accion.
- Generacion de datos sinteticos de comportamiento: producir rollouts de companero con `z` muestreado para aumentar la diversidad del dataset de entrenamiento de un agente.
- Evaluacion de robustez frente a companeros parcialmente observantes: usar el generador para medir como rinde un agente entrenado contra companeros que no ven el estado completo.
- Reproduccion de experimentos MAPBT/GOAT: cargar las carpetas directamente como `--vae_model_dir` en el codigo de entrenamiento original para replicar los resultados de validacion reportados.

## Benchmarks y rendimiento

Los unicos datos publicados son metricas de validacion del propio VAE (log-verosimilitud sumada sobre un chunk de 200 pasos, KL y precision de accion):

| Variante | Epoca | LL pase union | LL pase local | KL (pase de seleccion) | Precision union | Precision local |
|---|---|---|---|---|---|---|
| `b` | 497 | -619.47 | -620.14 | 26.48 | 0.1231 | 0.1223 |
| `c` | 497 | -619.72 | -619.70 | 25.95 | 0.1228 | 0.1228 |
| `c_dec` | 470 | -630.39 | -632.95 | 25.33 | 0.1072 | 0.1031 |

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni metricas de rendimiento de politica en el entorno).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo es pequeno (CNN de 32/64/32 canales y GRU de 256 unidades), por lo que cabe holgadamente en cualquier GPU consumer, aunque no se publica una cifra concreta.
- GPU recomendadas: cualquier GPU con soporte PyTorch; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU consumer: si, por el tamano reducido de la arquitectura, aunque no se documenta el consumo exacto.
- Opciones de despliegue: carga directa de `state_dict` en PyTorch; integracion en el codigo de entrenamiento MAPBT/GOAT mediante `--vae_model_dir`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos de partner-VAE comparables ni datos de referencia de alternativas.

## Limitaciones y advertencias

- Modelo especifico del entorno Burrito `open` con `agent_view_size=3`; no es transferible a otros entornos sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento en lenguaje natural.
- La precision de accion reportada es baja (en torno a 0.10-0.12), lo que limita la fidelidad del comportamiento generado.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier uso en produccion.
- El repositorio tiene 0 descargas y 0 likes, sin validacion externa de la comunidad.
- El encoder de 24 canales no encaja en la ruta estandar de VAE de 12 canales y es omitido por el loader; solo el decoder es utilizable en generacion.
- Riesgo de sesgos y alucinacion: no aplica en el sentido de NLP, pero el generador puede producir comportamientos poco realistas fuera de la distribucion de entrenamiento.
- No se documentan limitaciones de contexto o idioma porque el modelo no procesa lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/taekbae/burrito-open-mixview-vae
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
