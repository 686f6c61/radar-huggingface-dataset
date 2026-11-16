# sumankrsh/claims-triage-mini

## Resumen

claims-triage-mini es un par de clasificadores de texto ligeros desarrollados por Suman Mukherjee para la aseguradora ficticia Corvane Life. A partir de una nota de primer aviso de siniestro (FNOL, *first notification of loss*), el modelo sugiere el tipo de reclamacion (5 clases) y su urgencia (alta, normal, baja), acompanando cada prediccion de una probabilidad. No es un transformer ni un modelo de lenguaje: son dos regresiones logisticas multinomiales de scikit-learn sobre caracteristicas TF-IDF, empaquetadas en un JSON de 1 MB que se ejecuta en el navegador con unas 100 lineas de JavaScript.

El interes del proyecto no esta en su rendimiento bruto, sino en su honestidad metodologica: el autor publica de forma explicita como una validacion del 100 por ciento se desploma a un 87,8 por ciento en tipo de reclamacion y un 78,0 por ciento en urgencia cuando las notas se reformulan con palabras no vistas. Ademas documenta una ruta de abstencion (derivar a una persona) y mide cuantas notas de urgencia alta se escapan por esa ruta.

Se trata, por tanto, de una pieza docente y de demostracion sobre calibracion, atajos espurios y limites de la validacion, no de un modelo apto para produccion ni para decisiones reales sobre siniestros o personas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos regresiones logisticas multinomiales (scikit-learn 1.9.1, C = 4) sobre TF-IDF |
| Parametros totales | No disponible (pesos exportados en un JSON de 1 MB, redondeados a 4 cifras significativas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificacion de documento completo, sin ventana definida) |
| Tipos de cuantizacion | No aplica (pesos en coma flotante dentro de JSON) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | JSON (`model.json`), ejecutable en navegador via JavaScript |

Caracteristicas de entrada: TF-IDF de palabras con n-gramas 1-2 (solo letras, 3.887 caracteristicas) y TF-IDF de caracteres con n-gramas 3-5 dentro de palabras (8.000 caracteristicas), cada conjunto normalizado en L2 y con frecuencia de termino sublineal.

## Arquitectura y entrenamiento

El modelo no emplea una red neuronal. Cada una de las dos tareas (tipo de reclamacion y urgencia) se resuelve con una regresion logistica multinomial independiente sobre la concatenacion de dos representaciones TF-IDF (palabras y caracteres). El pipeline completo se entrena con scikit-learn 1.9.1 y se exporta a un unico archivo JSON que replica exactamente el comportamiento del codigo Python: la verificacion `evaluate.mjs` compara ambas implementaciones sobre las 1.350 notas de evaluacion y obtiene las mismas etiquetas en 1.350 de 1.350 casos, con una diferencia maxima de probabilidad de 5e-7.

Los datos de entrenamiento son exclusivamente sinteticos: el split de entrenamiento (2.100 notas) del dataset `sumankrsh/corvane-claim-notes` (CC BY 4.0), generado para la aseguradora ficticia Corvane Life. No se uso ningun dato real, de clientes ni de empleadores. Durante la seleccion de hiperparametros se compararon 6 configuraciones (2 conjuntos de caracteristicas y 3 fuerzas de regularizacion) sobre el split reservado del dataset, que por ello se reporta como conjunto de desarrollo y no como test limpio. Tras congelar la configuracion, se generaron 450 notas nuevas con el generador del propio dataset, ajustes reservados y una semilla nueva (20261116); ese conjunto (`data/fresh_test.jsonl`) se puntuo una sola vez.

## Capacidades

- Clasificacion de tipo de reclamacion en 5 clases: muerte natural, renta hospitalaria, enfermedad critica, discapacidad y muerte accidental.
- Clasificacion de urgencia en 3 niveles: alta, normal y baja.
- Salida de probabilidad por clase en ambas tareas, lo que permite umbrales de confianza y rutas de abstencion.
- Regla de triaje documentada: enrutado automatico solo si ambas etiquetas superan probabilidad 0,6; en caso contrario, derivacion a una persona; marca de urgencia alta si la probabilidad de esa clase es igual o superior a 0,3.
- Ejecucion integra en el navegador sin backend, gracias a la exportacion JSON y a `js/triage.js`.
- Verificacion de equivalencia entre la implementacion Python y la JavaScript sobre el conjunto de evaluacion.
- Sin soporte de tool calling, agentes, vision, audio ni razonamiento multi-paso: es un clasificador supervisado de una sola pasada.

## Casos de uso

- Demostracion docente de calibracion y abstencion: el modelo sirve para mostrar en clase o en un articulo como la precision cae del 100 por ciento en validacion al 78 por ciento en urgencia con reformulaciones nuevas, y como un umbral de confianza no basta para filtrar errores seguros de si mismos.
- Prototipo de mesa de triaje en un Space de Hugging Face: la demo `claims-triage-desk` usa el modelo para sugerir cola y prioridad sobre notas sinteticas, sin ningun dato real.
- Evaluacion de pipelines de clasificacion ligeros: al caber en 1 MB y ejecutarse en JavaScript, permite comparar latencia y coste frente a alternativas basadas en API antes de invertir en un modelo mayor.
- Analisis de atajos espurios: el autor documenta que las notas de baja urgencia siempre llevan referencia de reclamacion en el generador, de modo que el modelo puede apoyarse en esa pista en lugar del contenido; el caso sirve para ilustrar tecnicas de auditoria de features.
- Simulacion de reglas de negocio con derivacion humana: la regla de triaje fija (0,6 de confianza, 0,3 para urgencia alta) permite estudiar el compromiso entre volumen enrutado automaticamente y errores graves, con cifras concretas sobre el test fresco (269 enrutadas, 54 erroneas, 34 urgencias altas escapadas).
- Generacion de material de formacion sobre riesgo en seguros: las cinco clases y la distincion entre muerte natural y accidental permiten construir ejercicios sobre el coste asimetrico de los errores (un falso negativo en urgencia alta es mucho mas caro que un falso positivo).

## Benchmarks y rendimiento

Tipo de reclamacion:

| Conjunto | Aciertos | Precision | F1 macro | ECE |
|---|---|---|---|---|
| Validacion (450) | 450 / 450 | 100 % | 1.000 | 0.027 |
| Held-out, desarrollo (450) | 391 / 450 | 86,9 % | 0.848 | 0.101 |
| Test fresco (450) | 395 / 450 | 87,8 % | 0.858 | 0.126 |

Test fresco por clase (precision / recall / notas): muerte 75,7 % / 99,3 % / 135; renta hospitalaria 99,1 % / 82,7 % / 127; enfermedad critica 91,8 % / 98,9 % / 91; discapacidad 92,9 % / 76,5 % / 51; muerte accidental 100 % / 58,7 % / 46.

Urgencia:

| Conjunto | Aciertos | Precision | F1 macro | ECE |
|---|---|---|---|---|
| Validacion (450) | 450 / 450 | 100 % | 1.000 | 0.022 |
| Held-out, desarrollo (450) | 353 / 450 | 78,4 % | 0.738 | 0.114 |
| Test fresco (450) | 351 / 450 | 78,0 % | 0.716 | 0.099 |

Test fresco por clase (precision / recall / notas): alta 100 % / 44,9 % / 107; normal 73,5 % / 98,1 % / 263; baja 88,2 % / 56,3 % / 80. De las 107 notas de urgencia alta, 58 se leyeron como normales.

Regla de triaje:

| Conjunto | Enrutadas automaticamente | De esas, erroneas | Derivadas a persona | Urgencias altas enrutadas como no urgentes |
|---|---|---|---|---|
| Validacion | 450 | 0 | 0 | 0 de 133 |
| Held-out (desarrollo) | 277 | 66 | 173 | 49 de 116 |
| Test fresco | 269 | 54 | 181 | 34 de 107 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las cifras anteriores son las unicas reportadas por el autor.

## Requisitos de hardware

- Inferencia en CPU sin requisitos relevantes: el modelo pesa 1 MB en JSON y ejecuta dos productos matriz-vector sobre 11.887 caracteristicas TF-IDF.
- Cabe en cualquier GPU consumer, aunque no la necesita; tambien corre en navegador y en dispositivos de gama baja.
- Despliegue como pagina web estatica con `js/triage.js`, o como script Python con scikit-learn y el pipeline de entrenamiento incluido.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI: no es un modelo generativo ni usa safetensors o GGUF.
- Latencia y throughput: no disponibles de forma numerica en la informacion proporcionada; por la naturaleza del modelo (TF-IDF disperso y regresion logistica) el coste por nota es de microsegundos a pocos milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| claims-triage-mini | No disponible (JSON de 1 MB) | No aplica | TF-IDF + regresion logistica | Apache 2.0 | Hugging Face, ejecutable en navegador |
| Clasificadores de texto de scikit-learn genericos | Depende del vocabulario | No aplica | TF-IDF + modelo lineal | BSD (scikit-learn) | Biblioteca estandar |
| DistilBERT / MiniLM ajustados a clasificacion | 66 M / 22 M aprox. | 512 tokens | Transformer encoder | Apache 2.0 | Hugging Face |

No se dispone de comparaciones de rendimiento frente a estas alternativas en la informacion proporcionada; el autor solo compara el modelo consigo mismo entre conjuntos de evaluacion.

## Limitaciones y advertencias

- Notas sinteticas y plantilladas: las notas reales son mas sucias (erratas, *Hinglish*, abreviaturas); la precision en el mundo real es desconocida y probablemente inferior.
- Sobreconfianza ante formulaciones no vistas: el error de calibracion sube de aproximadamente 0,02 en validacion a aproximadamente 0,1 con fraseo nuevo, de modo que un umbral ajustado con notas familiares deja pasar errores con alta confianza.
- Atajos espurios: en el generador, las notas de baja urgencia siempre llevan referencia de reclamacion, por lo que el modelo puede apoyarse en esa pista en lugar del contenido de la nota.
- La urgencia es un juicio y aqui procede de una unica frase indicio por nota; un modelo asi solo deberia anadir una marca para revision humana, nunca retirarla.
- Errores asimetricos documentados: de 107 notas de urgencia alta en el test fresco, 58 se clasificaron como normales; las muertes accidentales se confunden a menudo con muerte natural (recall del 58,7 por ciento).
- Sin analisis de equidad: las notas no tienen atributos demograficos y los nombres son ficticios, pero no se ha comprobado que no aporten senal.
- Uso prohibido: no debe decidir, retrasar ni rechazar reclamaciones reales; en cualquier uso real la decision es humana y los signos urgentes (dificultad economica, UCI, plazos vencidos) se verifican persona a persona.
- Licencia Apache 2.0 permite uso comercial del codigo, pero el propio autor desaconseja explicitamente su uso en produccion con datos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sumankrsh/claims-triage-mini
- Dataset de entrenamiento: https://huggingface.co/datasets/sumankrsh/corvane-claim-notes
- Demo (Space): https://huggingface.co/spaces/sumankrsh/claims-triage-desk
- Perfil del autor en LinkedIn: https://www.linkedin.com/in/sumanmukherjee91k
