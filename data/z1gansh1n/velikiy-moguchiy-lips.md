# z1gansh1n/velikiy-moguchiy-lips

## Resumen

El modelo `velikiy-moguchiy-lips` no es un modelo de lenguaje, sino un modelo de reconocimiento visual del habla (lectura de labios o *Visual Speech Recognition*, VSR) especializado en ruso. Lo desarrolla el autor `z1gansh1n` dentro del proyecto «Velikiy & Moguchiy» y consiste en un ajuste fino del modelo MultiVSR creado por Sindhu Hegde y colaboradores en el Oxford VGG. El problema que resuelve es transcribir lo que una persona dice a partir unicamente de la imagen de su rostro, sin usar audio.

El ajuste se ha realizado sobre aproximadamente 54 horas de video en 720p procedentes de unas 420 fuentes de tipo «persona hablando a camara», con 2,8 pasadas sobre el conjunto de datos. Se distribuye como un adaptador LoRA junto con la parte visual del modelo ya reentrenada, no como un modelo completo.

Su relevancia es limitada y experimental: el propio autor lo describe como un modelo temporal que sera sustituido por una version entrenada desde cero cuando el proyecto reuna suficientes datos. El repositorio de HuggingFace ocupa tan solo 0,1 GB y no ha registrado descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | reconocimiento visual del habla (VSR), derivada de MultiVSR; incluye un adaptador LoRA y una parte visual reentrenada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision y habla, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ruso (idioma de los datos de entrenamiento) |
| Licencia | no disponible; se debe usar bajo los terminos de los autores de MultiVSR y citando su trabajo |
| Formato de pesos | PyTorch (`.pt` para el LoRA y `.pth` para la parte visual) |

## Arquitectura y entrenamiento

La arquitectura subyacente es MultiVSR, un sistema de reconocimiento visual del habla desarrollado en el Oxford VGG. El modelo distribuido en este repositorio no es un modelo completo, sino una combinacion de dos componentes: un adaptador LoRA (`velikiy-moguchiy-lips-0.1.pt`) con los ajustes del modelo, y una parte visual reentrenada (`velikiy-moguchiy-lips-0.1-venc.pth`). La arquitectura completa (`model.pth`) debe descargarse por separado desde el repositorio de los autores originales.

Los datos de entrenamiento consisten en aproximadamente 54 horas de video en ruso, con resolucion 720p, procedentes de unas 420 fuentes distintas de contenido «persona hablando a camara», sobre las que se realizaron 2,8 pasadas. La model card no detalla la composicion exacta del dataset, el uso de tecnicas de RLHF o DPO (no aplicables a un modelo de VSR), ni innovaciones tecnicas adicionales mas alla del ajuste fino. Se trata explicitamente de un modelo temporal dentro del proyecto.

## Capacidades

- Transcripcion visual del habla en ruso: convierte el movimiento labial captado en video en texto, sin necesidad de pista de audio.
- Funcionamiento con personas no vistas en el entrenamiento: el modelo se evalua especificamente sobre personas desconocidas (MuAViC-ru, 13 sujetos).
- Uso como adaptador sobre MultiVSR: requiere el modelo base de los autores de Oxford VGG para funcionar.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no; el entrenamiento y el uso previsto son exclusivamente en ruso.
- Capacidades especiales: ninguna adicional documentada (sin modo de razonamiento, vision general ni audio).

## Casos de uso

- Transcripcion de video sin audio en ruso: el modelo permite recuperar el texto hablado en grabaciones donde la pista de audio se ha perdido o esta corrupta, usando unicamente la imagen del rostro.
- Accesibilidad para personas con discapacidad auditiva en contenido en ruso: se puede combinar con subtitulado automatico cuando no hay audio disponible, aunque su tasa de error actual limita su uso a contextos de baja exigencia.
- Analisis de medios de comunicacion en ruso: extraccion de declaraciones a partir de metraje de archivo sin sonido para tareas de investigacion periodistica o academica.
- Investigacion en reconocimiento visual del habla: sirve como punto de partida o referencia para experimentos de VSR en ruso, gracias a que es un ajuste reproducible sobre MultiVSR.
- Vigilancia y analisis forense de video: lectura de labios en grabaciones silenciosas, siempre con las cautelas legales y eticas correspondientes y asumiendo una tasa de error elevada.
- Prototipado de interfaces hombre-maquina sin audio: pruebas de concepto de control o dictado basado en vision en entornos ruidosos donde el audio no es fiable.
- Generacion de subtitulos para corpus de investigacion en ruso: creacion de transcripciones preliminares que luego se corrigen manualmente antes de usarse como datos de entrenamiento.

## Benchmarks y rendimiento

La model card incluye dos medidas de tasa de error en palabras (WER, menor es mejor): una sobre personas desconocidas del conjunto MuAViC-ru (13 sujetos) y otra sobre la prueba silenciosa propia del autor.

| Modelo | MuAViC-ru (13 personas desconocidas) | Prueba silenciosa del autor |
|---|---|---|
| MultiVSR original (ajustado en la primera recogida) | 76,0 % | 86,5 % |
| lips-0.1 | 72,3 % | 77,6 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base MultiVSR (`model.pth`), que debe descargarse aparte y cuyo tamano no se especifica.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el repositorio de este ajuste ocupa solo 0,1 GB, pero requiere el modelo base completo para funcionar.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser pesos PyTorch de un modelo de vision, el despliegue se realiza mediante el propio codigo de MultiVSR.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / idioma | Rendimiento (WER) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| velikiy-moguchiy-lips (lips-0.1) | VSR, ajuste LoRA sobre MultiVSR | ruso | 72,3 % en MuAViC-ru | no disponible (terminos de MultiVSR) | repositorio HuggingFace del autor |
| MultiVSR | VSR base | multilingue segun autores | 76,0 % en la configuracion comparada | la de los autores | GitHub de Sindhu Hegde |

No se dispone de datos comparativos con otras alternativas de VSR (por ejemplo AV-HuBERT o Auto-AVSR) en la informacion proporcionada, por lo que no se incluyen.

## Limitaciones y advertencias

- Es un modelo temporal, no una version final: el propio autor advierte que sera reemplazado por un modelo entrenado desde cero cuando haya mas datos.
- Tasa de error elevada: incluso en la mejor medicion (72,3 % de WER) se pierde mas de una de cada cuatro palabras, lo que lo hace inadecuado para transcripcion de alta calidad sin revision humana.
- Sesgos potenciales derivados del dataset: 54 horas de video de unas 420 fuentes pueden sobrerrepresentar determinados acentos, registros y condiciones de grabacion.
- Idiomas: funciona unicamente en ruso; no hay evidencia de generalizacion a otras lenguas.
- Dependencia del modelo base: no funciona de forma autonoma; requiere los pesos de MultiVSR descargados por separado.
- Restricciones de licencia: la licencia no esta declarada en HuggingFace; el autor indica que debe usarse bajo los terminos de los autores de MultiVSR y con atribucion, por lo que el uso comercial no esta garantizado.
- Riesgo de alucinacion: como todo sistema de reconocimiento visual del habla, puede generar palabras plausibles que no se corresponden con lo pronunciado, especialmente con iluminacion deficiente, oclusiones o movimientos de cabeza.
- Sin datos publicos de benchmarks mas alla de las dos metricas de la model card, ni resultados de contexto, cuantizacion o despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/z1gansh1n/velikiy-moguchiy-lips
- Repositorio del proyecto «Velikiy & Moguchiy»: https://github.com/zigansh1n/velikiy-moguchiy
- Informe del proyecto: https://github.com/zigansh1n/velikiy-moguchiy/blob/main/docs/REPORT.md
- Modelo base MultiVSR (Sindhu Hegde y colaboradores, Oxford VGG): https://github.com/Sindhu-Hegde/multivsr
- Release de los pesos lips-0.1: https://github.com/zigansh1n/velikiy-moguchiy-models/releases/tag/lips-0.1
